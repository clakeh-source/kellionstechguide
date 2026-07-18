import type { Device, Link, PathHop, PingResult, RouterConfig, SwitchL2Config, SwitchL3Config, Topology } from "../types";
import { inNetwork, ipToInt, maskToInt, prefixOf, sameSubnet } from "./ip";

function isL3(d: Device): boolean {
  if (d.kind === "router") return true;
  if (d.kind === "switchL3") return (d.config as SwitchL3Config).ipRoutingEnabled;
  return false;
}

function linkOnPort(topo: Topology, deviceId: string, portId: string): Link | null {
  for (const l of Object.values(topo.links)) {
    if (l.aDeviceId === deviceId && l.aPortId === portId) return l;
    if (l.bDeviceId === deviceId && l.bPortId === portId) return l;
  }
  return null;
}

function otherEnd(link: Link, deviceId: string) {
  if (link.aDeviceId === deviceId) return { deviceId: link.bDeviceId, portId: link.bPortId };
  return { deviceId: link.aDeviceId, portId: link.aPortId };
}

function findDeviceByIp(topo: Topology, ip: string): Device | null {
  for (const d of Object.values(topo.devices)) {
    if (d.kind === "pc") {
      if ((d.config as any).ip === ip) return d;
    } else if (d.kind === "router") {
      const cfg = d.config as RouterConfig;
      for (const i of Object.values(cfg.interfaces)) if (i.ip === ip) return d;
    } else if (d.kind === "switchL3") {
      const cfg = d.config as SwitchL3Config;
      for (const s of Object.values(cfg.svis)) if (s.ip === ip) return d;
    }
  }
  return null;
}

interface RouteMatch { egressIface: string; nextHop: string | null; }

function longestPrefixMatch(cfg: RouterConfig | SwitchL3Config, dstIp: string): RouteMatch | null {
  let best: (RouteMatch & { prefix: number }) | null = null;

  // Directly connected: router interfaces / L3 SVIs
  const connected: { network: string; mask: string; iface: string }[] = [];
  if ("interfaces" in cfg && (cfg as RouterConfig).interfaces) {
    for (const iface of Object.values((cfg as RouterConfig).interfaces)) {
      if ("ip" in iface && iface.ip && iface.mask && !(iface as any).shutdown) {
        connected.push({ network: iface.ip, mask: iface.mask, iface: iface.name });
      }
    }
  }
  if ("svis" in cfg) {
    for (const svi of Object.values((cfg as SwitchL3Config).svis)) {
      if (svi.ip && svi.mask && !svi.shutdown) {
        connected.push({ network: svi.ip, mask: svi.mask, iface: `Vlan${svi.vlanId}` });
      }
    }
  }
  for (const c of connected) {
    if (inNetwork(dstIp, c.network, c.mask)) {
      const p = prefixOf(c.mask);
      if (!best || p > best.prefix) best = { egressIface: c.iface, nextHop: null, prefix: p };
    }
  }

  const staticRoutes = "staticRoutes" in cfg ? cfg.staticRoutes : [];
  for (const r of staticRoutes) {
    if (inNetwork(dstIp, r.network, r.mask)) {
      // Find which iface leads to nextHop (must be on a connected subnet)
      const nh = connected.find((c) => sameSubnet(c.network, c.mask, r.nextHop));
      if (!nh) continue;
      const p = prefixOf(r.mask);
      if (!best || p > best.prefix) best = { egressIface: nh.iface, nextHop: r.nextHop, prefix: p };
    }
  }

  return best;
}

// From an L2 switch, follow same-VLAN links until we reach a device whose IP matches nextHopIp.
// Returns the egress port on `switchDev` toward that host.
function findL2Egress(
  topo: Topology,
  switchDev: Device,
  ingressPortId: string | undefined,
  vlan: number,
  targetIp: string,
): { egressPort: string } | null {
  const startCfg = switchDev.config as SwitchL2Config;

  const isSwitchLikeL2 = (d: Device) => d.kind === "switchL2" || (d.kind === "switchL3" && !(d.config as SwitchL3Config).ipRoutingEnabled);

  // DFS through switch fabric on the given VLAN
  const visited = new Set<string>();
  const stack: { device: Device; ingress?: string; egressFromStart?: string }[] = [];

  for (const port of switchDev.ports) {
    if (port.id === ingressPortId) continue;
    const iface = startCfg.interfaces[port.id];
    if (!iface || iface.shutdown) continue;
    const vlanOk = iface.mode === "access" ? iface.accessVlan === vlan : (!iface.allowedVlans || iface.allowedVlans.includes(vlan));
    if (!vlanOk) continue;
    const link = linkOnPort(topo, switchDev.id, port.id);
    if (!link) continue;
    const other = otherEnd(link, switchDev.id);
    const otherDev = topo.devices[other.deviceId];
    if (!otherDev) continue;
    // Check other end iface vlan
    if (isSwitchLikeL2(otherDev) || otherDev.kind === "switchL2") {
      const ci = (otherDev.config as SwitchL2Config).interfaces?.[other.portId];
      if (!ci || ci.shutdown) continue;
      const ok = ci.mode === "access" ? ci.accessVlan === vlan : (!ci.allowedVlans || ci.allowedVlans.includes(vlan));
      if (!ok) continue;
    }
    // If neighbor is a host with matching IP -> done
    if (otherDev.kind === "pc" && (otherDev.config as PcAny).ip === targetIp) {
      return { egressPort: port.id };
    }
    // If neighbor is a router with matching IP on that port -> done
    if (otherDev.kind === "router") {
      const rif = (otherDev.config as RouterConfig).interfaces[other.portId];
      if (rif?.ip === targetIp) return { egressPort: port.id };
    }
    if (otherDev.kind === "switchL3" && (otherDev.config as SwitchL3Config).ipRoutingEnabled) {
      // Check SVI on this VLAN for match
      const svi = (otherDev.config as SwitchL3Config).svis[vlan];
      if (svi?.ip === targetIp) return { egressPort: port.id };
    }
    if (isSwitchLikeL2(otherDev)) {
      stack.push({ device: otherDev, ingress: other.portId, egressFromStart: port.id });
    }
  }

  while (stack.length) {
    const { device, ingress, egressFromStart } = stack.pop()!;
    if (visited.has(device.id)) continue;
    visited.add(device.id);
    const cfg = device.config as SwitchL2Config;
    for (const port of device.ports) {
      if (port.id === ingress) continue;
      const iface = cfg.interfaces[port.id];
      if (!iface || iface.shutdown) continue;
      const vlanOk = iface.mode === "access" ? iface.accessVlan === vlan : (!iface.allowedVlans || iface.allowedVlans.includes(vlan));
      if (!vlanOk) continue;
      const link = linkOnPort(topo, device.id, port.id);
      if (!link) continue;
      const other = otherEnd(link, device.id);
      const otherDev = topo.devices[other.deviceId];
      if (!otherDev) continue;
      // Check neighbor iface vlan
      if (otherDev.kind === "switchL2" || otherDev.kind === "switchL3") {
        const ci = (otherDev.config as SwitchL2Config).interfaces?.[other.portId];
        if (!ci || ci.shutdown) continue;
        const ok = ci.mode === "access" ? ci.accessVlan === vlan : (!ci.allowedVlans || ci.allowedVlans.includes(vlan));
        if (!ok) continue;
      }
      if (otherDev.kind === "pc" && (otherDev.config as PcAny).ip === targetIp) {
        return { egressPort: egressFromStart! };
      }
      if (otherDev.kind === "router") {
        const rif = (otherDev.config as RouterConfig).interfaces[other.portId];
        if (rif?.ip === targetIp) return { egressPort: egressFromStart! };
      }
      if (otherDev.kind === "switchL3" && (otherDev.config as SwitchL3Config).ipRoutingEnabled) {
        const svi = (otherDev.config as SwitchL3Config).svis[vlan];
        if (svi?.ip === targetIp) return { egressPort: egressFromStart! };
      }
      if (otherDev.kind === "switchL2" || (otherDev.kind === "switchL3" && !(otherDev.config as SwitchL3Config).ipRoutingEnabled)) {
        stack.push({ device: otherDev, ingress: other.portId, egressFromStart });
      }
    }
  }

  return null;
}

type PcAny = { ip?: string; mask?: string; gateway?: string; hostname: string };

export function simulatePing(topo: Topology, srcId: string, dstIp: string): PingResult {
  const src = topo.devices[srcId];
  const path: PathHop[] = [];
  if (!src) return { ok: false, path, reason: "Source device not found" };
  if (src.kind !== "pc") return { ok: false, path, reason: "Ping must originate from a PC" };
  const srcCfg = src.config as PcAny;
  if (!srcCfg.ip || !srcCfg.mask) return { ok: false, path, reason: `${src.name} has no IP configured` };

  if (ipToInt(dstIp) === null) return { ok: false, path, reason: `${dstIp} is not a valid IPv4 address` };
  const dstDev = findDeviceByIp(topo, dstIp);
  if (!dstDev) return { ok: false, path, reason: `No device has IP ${dstIp}` };

  let nextHopIp: string;
  if (sameSubnet(srcCfg.ip, srcCfg.mask, dstIp)) {
    nextHopIp = dstIp;
  } else {
    if (!srcCfg.gateway) return { ok: false, path, reason: `${src.name}: destination is on another subnet and no default gateway is set` };
    if (!sameSubnet(srcCfg.ip, srcCfg.mask, srcCfg.gateway)) return { ok: false, path, reason: `${src.name}: gateway ${srcCfg.gateway} is not on the same subnet` };
    nextHopIp = srcCfg.gateway;
  }

  let currentDevice: Device = src;
  let incomingPort: string | undefined = undefined;
  let currentVlan: number | null = null;
  path.push({ deviceId: src.id });

  for (let hop = 0; hop < 30; hop++) {
    const hopEntry = path[path.length - 1];

    if (currentDevice.kind === "pc" && currentDevice.id !== src.id) {
      // Arrived at a PC (destination)
      if ((currentDevice.config as PcAny).ip === dstIp) return { ok: true, path };
      return { ok: false, path, reason: `Packet delivered to ${currentDevice.name}, not ${dstIp}` };
    }

    // Determine egress
    let egressPort: string | null = null;
    let nextHopIpForNext: string = nextHopIp;

    if (currentDevice.kind === "pc") {
      egressPort = "eth0";
    } else if (isL3(currentDevice)) {
      const cfg = currentDevice.config as RouterConfig | SwitchL3Config;
      const route = longestPrefixMatch(cfg, nextHopIp);
      if (!route) return { ok: false, path, reason: `${currentDevice.name}: no route to ${nextHopIp}` };
      egressPort = route.egressIface;
      if (route.nextHop) nextHopIpForNext = route.nextHop;

      // If egress is an SVI (VlanX) — enter L2 fabric on that VLAN
      if (egressPort.startsWith("Vlan")) {
        const vlan = Number(egressPort.slice(4));
        // Find an interface on this switch in that VLAN that leads to nextHopIpForNext
        const egress = findL2Egress(topo, currentDevice, undefined, vlan, nextHopIpForNext);
        if (!egress) return { ok: false, path, reason: `${currentDevice.name}: no L2 path in VLAN ${vlan} to ${nextHopIpForNext}` };
        egressPort = egress.egressPort;
        currentVlan = vlan;
      } else {
        // Verify egress iface not shutdown
        const iface = cfg.interfaces[egressPort];
        if (!iface || (iface as any).shutdown) return { ok: false, path, reason: `${currentDevice.name}: egress ${egressPort} is administratively down` };
        currentVlan = null;
      }
    } else {
      // L2 switch forwarding
      const cfg = currentDevice.config as SwitchL2Config;
      if (currentVlan === null) {
        // determine VLAN from ingress port
        const ing = incomingPort ? cfg.interfaces[incomingPort] : undefined;
        if (!ing) return { ok: false, path, reason: `${currentDevice.name}: ingress port has no config` };
        if (ing.shutdown) return { ok: false, path, reason: `${currentDevice.name}: ingress ${incomingPort} is shutdown` };
        currentVlan = ing.mode === "access" ? (ing.accessVlan ?? 1) : 1;
      }
      const egress = findL2Egress(topo, currentDevice, incomingPort, currentVlan, nextHopIp);
      if (!egress) return { ok: false, path, reason: `${currentDevice.name}: no path to ${nextHopIp} in VLAN ${currentVlan}` };
      egressPort = egress.egressPort;
    }

    if (!egressPort) return { ok: false, path, reason: `${currentDevice.name}: could not determine egress` };
    hopEntry.egressPortId = egressPort;

    const link = linkOnPort(topo, currentDevice.id, egressPort);
    if (!link) return { ok: false, path, reason: `${currentDevice.name}: ${egressPort} is not cabled` };
    const other = otherEnd(link, currentDevice.id);
    const nextDev = topo.devices[other.deviceId];
    if (!nextDev) return { ok: false, path, reason: `Broken link on ${currentDevice.name} ${egressPort}` };

    // Validate ingress on next device
    if (nextDev.kind === "router") {
      const rif = (nextDev.config as RouterConfig).interfaces[other.portId];
      if (!rif || rif.shutdown) return { ok: false, path, reason: `${nextDev.name}: ingress ${other.portId} is shutdown` };
      currentVlan = null;
    } else if (nextDev.kind === "switchL2" || nextDev.kind === "switchL3") {
      const sif = (nextDev.config as SwitchL2Config).interfaces[other.portId];
      if (!sif || sif.shutdown) return { ok: false, path, reason: `${nextDev.name}: ingress ${other.portId} is shutdown` };
      if (currentVlan !== null) {
        if (sif.mode === "access") {
          if (sif.accessVlan !== currentVlan) return { ok: false, path, reason: `${nextDev.name} ${other.portId}: VLAN mismatch (access ${sif.accessVlan}, expected ${currentVlan})` };
        } else {
          if (sif.allowedVlans && !sif.allowedVlans.includes(currentVlan)) return { ok: false, path, reason: `${nextDev.name} ${other.portId}: VLAN ${currentVlan} not allowed on trunk` };
        }
      } else {
        currentVlan = sif.mode === "access" ? (sif.accessVlan ?? 1) : 1;
      }
    }

    path.push({ deviceId: nextDev.id, ingressPortId: other.portId });
    incomingPort = other.portId;
    currentDevice = nextDev;
    nextHopIp = nextHopIpForNext;
  }

  return { ok: false, path, reason: "TTL exceeded (loop or too many hops)" };
}
