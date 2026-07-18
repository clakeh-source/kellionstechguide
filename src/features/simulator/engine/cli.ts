import type { Device, PcConfig, RouterConfig, SwitchL2Config, SwitchL3Config, SwitchInterface } from "../types";
import { ipToInt, isValidIp, maskToInt } from "./ip";

export interface CliState {
  mode: "user" | "enable" | "config" | "config-if" | "config-vlan" | "pc";
  currentIface?: string;
  currentVlan?: number;
}

export interface CliResult {
  output: string[];
  state: CliState;
  device: Device;
}

export function initialState(kind: Device["kind"]): CliState {
  return { mode: kind === "pc" ? "pc" : "user" };
}

export function prompt(device: Device, state: CliState): string {
  if (device.kind === "pc") return `${device.config.hostname}> `;
  const h = device.config.hostname;
  if (state.mode === "user") return `${h}> `;
  if (state.mode === "enable") return `${h}# `;
  if (state.mode === "config") return `${h}(config)# `;
  if (state.mode === "config-if") return `${h}(config-if)# `;
  if (state.mode === "config-vlan") return `${h}(config-vlan)# `;
  return `${h}# `;
}

const INVALID = "% Invalid input detected at '^' marker.";

function clone<T>(x: T): T { return JSON.parse(JSON.stringify(x)); }

// ---------- Router / L3 switch CLI ----------

function normalizeIface(cfg: RouterConfig | SwitchL2Config | SwitchL3Config, name: string): string | null {
  // Accept shorthand: g0/0 -> Gi0/0, f0/1 -> Fa0/1, vlan10 -> Vlan10
  const lower = name.toLowerCase().replace(/\s+/g, "");
  const map: Record<string, string> = {};
  const keys = Object.keys(cfg.interfaces);
  for (const k of keys) map[k.toLowerCase()] = k;
  if (map[lower]) return map[lower];
  // Expand common shortcuts
  const m1 = lower.match(/^(g|gi|gigabitethernet)(\d+\/\d+)$/);
  if (m1) {
    const cand = `Gi${m1[2]}`;
    if (map[cand.toLowerCase()]) return cand;
  }
  const m2 = lower.match(/^(f|fa|fastethernet)(\d+\/\d+)$/);
  if (m2) {
    const cand = `Fa${m2[2]}`;
    if (map[cand.toLowerCase()]) return cand;
  }
  // Vlan interfaces on L3 switch aren't in interfaces{} — handled elsewhere
  return null;
}

function runRouterCli(device: Device, raw: string, state: CliState): CliResult {
  const dev = clone(device);
  const cfg = dev.config as RouterConfig;
  const out: string[] = [];
  let s = { ...state };
  const cmd = raw.trim();
  const parts = cmd.split(/\s+/);
  const p0 = parts[0]?.toLowerCase() ?? "";

  if (!cmd) return { output: [], state: s, device: dev };

  // Global anywhere
  if (p0 === "?" || cmd === "help") { out.push("Type commands like 'enable', 'configure terminal', 'interface Gi0/0', 'ip address', 'no shutdown', 'ip route', 'show ip interface brief', 'show ip route'."); return {output:out,state:s,device:dev}; }
  if (p0 === "end") { s = { mode: "enable" }; return { output: out, state: s, device: dev }; }
  if (p0 === "exit") {
    if (s.mode === "config-if" || s.mode === "config-vlan") s.mode = "config";
    else if (s.mode === "config") s.mode = "enable";
    else if (s.mode === "enable") s.mode = "user";
    return { output: out, state: s, device: dev };
  }

  if (s.mode === "user") {
    if (p0 === "enable" || cmd === "en") { s.mode = "enable"; return { output: out, state: s, device: dev }; }
    if (p0 === "show") { out.push("% Move to enable mode first (type 'enable')."); return { output: out, state: s, device: dev }; }
    out.push(INVALID); return { output: out, state: s, device: dev };
  }

  if (s.mode === "enable") {
    if (cmd === "configure terminal" || cmd === "conf t" || cmd === "config t" || cmd === "configure") {
      s.mode = "config"; out.push("Enter configuration commands, one per line.  End with CNTL/Z."); return { output: out, state: s, device: dev };
    }
    if (p0 === "show") return runShow(dev, parts, s);
    if (p0 === "disable") { s.mode = "user"; return { output: out, state: s, device: dev }; }
    out.push(INVALID); return { output: out, state: s, device: dev };
  }

  if (s.mode === "config") {
    if (parts[0] === "hostname" && parts[1]) { cfg.hostname = parts[1]; dev.name = parts[1]; return { output: out, state: s, device: dev }; }
    if (parts[0] === "interface" && parts[1]) {
      const iname = normalizeIface(cfg, parts.slice(1).join(""));
      if (!iname) { out.push(`% Unknown interface ${parts.slice(1).join(" ")}`); return { output: out, state: s, device: dev }; }
      s = { mode: "config-if", currentIface: iname };
      return { output: out, state: s, device: dev };
    }
    if (parts[0] === "ip" && parts[1] === "route") {
      // ip route <net> <mask> <nexthop>
      const [, , net, mask, nh] = parts;
      if (!net || !mask || !nh || !isValidIp(net) || maskToInt(mask) === null || !isValidIp(nh)) {
        out.push("% Usage: ip route <network> <mask> <next-hop>"); return { output: out, state: s, device: dev };
      }
      cfg.staticRoutes.push({ network: net, mask, nextHop: nh });
      return { output: out, state: s, device: dev };
    }
    if (parts[0] === "no" && parts[1] === "ip" && parts[2] === "route") {
      const [, , , net, mask, nh] = parts;
      cfg.staticRoutes = cfg.staticRoutes.filter((r) => !(r.network === net && r.mask === mask && (!nh || r.nextHop === nh)));
      return { output: out, state: s, device: dev };
    }
    out.push(INVALID); return { output: out, state: s, device: dev };
  }

  if (s.mode === "config-if") {
    const iface = cfg.interfaces[s.currentIface!];
    if (!iface) { s.mode = "config"; out.push("% Interface disappeared"); return { output: out, state: s, device: dev }; }
    if (parts[0] === "ip" && parts[1] === "address" && parts[2] && parts[3]) {
      if (!isValidIp(parts[2])) { out.push("% Invalid IP address"); return {output:out,state:s,device:dev}; }
      if (maskToInt(parts[3]) === null) { out.push("% Invalid mask"); return {output:out,state:s,device:dev}; }
      iface.ip = parts[2]; iface.mask = parts[3];
      return { output: out, state: s, device: dev };
    }
    if (cmd === "no shutdown" || cmd === "no shut") { iface.shutdown = false; out.push(`%LINK-3-UPDOWN: Interface ${iface.name}, changed state to up`); return { output: out, state: s, device: dev }; }
    if (cmd === "shutdown" || cmd === "shut") { iface.shutdown = true; out.push(`%LINK-5-CHANGED: Interface ${iface.name}, changed state to administratively down`); return { output: out, state: s, device: dev }; }
    if (parts[0] === "description") return { output: out, state: s, device: dev };
    out.push(INVALID); return { output: out, state: s, device: dev };
  }

  out.push(INVALID); return { output: out, state: s, device: dev };
}

function runShow(dev: Device, parts: string[], s: CliState): CliResult {
  const out: string[] = [];
  const cfg = dev.config as RouterConfig | SwitchL3Config;
  const sub = parts.slice(1).join(" ").toLowerCase();

  if (dev.kind === "router" || dev.kind === "switchL3") {
    if (sub === "ip interface brief" || sub === "ip int br") {
      out.push("Interface              IP-Address      OK? Method Status                Protocol");
      for (const i of Object.values((cfg as RouterConfig).interfaces)) {
        const ip = i.ip ?? "unassigned";
        const status = i.shutdown ? "administratively down" : "up";
        const proto = i.shutdown ? "down" : "up";
        out.push(`${i.name.padEnd(22)} ${ip.padEnd(15)} YES manual ${status.padEnd(21)} ${proto}`);
      }
      if (dev.kind === "switchL3") {
        for (const svi of Object.values((cfg as SwitchL3Config).svis)) {
          const ip = svi.ip ?? "unassigned";
          const status = svi.shutdown ? "administratively down" : "up";
          out.push(`${("Vlan"+svi.vlanId).padEnd(22)} ${ip.padEnd(15)} YES manual ${status.padEnd(21)} ${svi.shutdown ? "down" : "up"}`);
        }
      }
      return { output: out, state: s, device: dev };
    }
    if (sub === "ip route") {
      out.push("Codes: C - connected, S - static");
      out.push("");
      const routes: string[] = [];
      for (const i of Object.values((cfg as RouterConfig).interfaces ?? {})) {
        if (i.ip && i.mask && !i.shutdown) routes.push(`C    ${networkOf(i.ip, i.mask)} is directly connected, ${i.name}`);
      }
      if (dev.kind === "switchL3") {
        for (const svi of Object.values((cfg as SwitchL3Config).svis)) {
          if (svi.ip && svi.mask && !svi.shutdown) routes.push(`C    ${networkOf(svi.ip, svi.mask)} is directly connected, Vlan${svi.vlanId}`);
        }
      }
      for (const r of (cfg as RouterConfig).staticRoutes ?? []) {
        routes.push(`S    ${r.network} [1/0] via ${r.nextHop}`);
      }
      if (routes.length === 0) out.push("(no routes)");
      out.push(...routes);
      return { output: out, state: s, device: dev };
    }
    if (sub === "running-config" || sub === "run") {
      out.push(...buildRunningConfig(dev));
      return { output: out, state: s, device: dev };
    }
  }

  if (dev.kind === "switchL2" || dev.kind === "switchL3") {
    if (sub === "vlan brief" || sub === "vlan") {
      const scfg = dev.config as SwitchL2Config;
      out.push("VLAN Name                             Status    Ports");
      out.push("---- -------------------------------- --------- -------------------------------");
      for (const v of Object.values(scfg.vlans)) {
        const members = Object.values(scfg.interfaces).filter((i) => i.mode === "access" && i.accessVlan === v.id).map((i) => i.name).join(", ");
        out.push(`${String(v.id).padEnd(4)} ${v.name.padEnd(32)} active    ${members}`);
      }
      return { output: out, state: s, device: dev };
    }
    if (sub === "interfaces trunk" || sub === "int trunk") {
      const scfg = dev.config as SwitchL2Config;
      out.push("Port        Mode         Allowed vlans");
      for (const i of Object.values(scfg.interfaces)) {
        if (i.mode === "trunk") out.push(`${i.name.padEnd(11)} trunk        ${(i.allowedVlans?.join(",") || "1-4094")}`);
      }
      return { output: out, state: s, device: dev };
    }
  }

  out.push(INVALID); return { output: out, state: s, device: dev };
}

function networkOf(ip: string, mask: string): string {
  const a = ipToInt(ip)!;
  const m = maskToInt(mask)!;
  const n = (a & m) >>> 0;
  return `${(n>>>24)&255}.${(n>>>16)&255}.${(n>>>8)&255}.${n&255}/${prefixCount(m)}`;
}
function prefixCount(m: number): number { let c=0; while (m & 0x80000000) { c++; m=(m<<1)>>>0; } return c; }

function buildRunningConfig(dev: Device): string[] {
  const out: string[] = [];
  out.push("!");
  out.push(`hostname ${dev.config.hostname}`);
  out.push("!");
  if (dev.kind === "switchL2" || dev.kind === "switchL3") {
    const scfg = dev.config as SwitchL2Config;
    for (const v of Object.values(scfg.vlans)) if (v.id !== 1) { out.push(`vlan ${v.id}`); out.push(` name ${v.name}`); out.push("!"); }
    for (const i of Object.values(scfg.interfaces)) {
      out.push(`interface ${i.name}`);
      if (i.mode === "trunk") { out.push(" switchport mode trunk"); if (i.allowedVlans?.length) out.push(` switchport trunk allowed vlan ${i.allowedVlans.join(",")}`); }
      else { out.push(" switchport mode access"); if (i.accessVlan && i.accessVlan !== 1) out.push(` switchport access vlan ${i.accessVlan}`); }
      if (i.shutdown) out.push(" shutdown");
      out.push("!");
    }
    if (dev.kind === "switchL3") {
      const l3 = dev.config as SwitchL3Config;
      if (l3.ipRoutingEnabled) { out.push("ip routing"); out.push("!"); }
      for (const svi of Object.values(l3.svis)) {
        out.push(`interface Vlan${svi.vlanId}`);
        if (svi.ip) out.push(` ip address ${svi.ip} ${svi.mask}`);
        if (svi.shutdown) out.push(" shutdown"); else out.push(" no shutdown");
        out.push("!");
      }
      for (const r of l3.staticRoutes) out.push(`ip route ${r.network} ${r.mask} ${r.nextHop}`);
    }
  }
  if (dev.kind === "router") {
    const rcfg = dev.config as RouterConfig;
    for (const i of Object.values(rcfg.interfaces)) {
      out.push(`interface ${i.name}`);
      if (i.ip) out.push(` ip address ${i.ip} ${i.mask}`);
      if (i.shutdown) out.push(" shutdown"); else out.push(" no shutdown");
      out.push("!");
    }
    for (const r of rcfg.staticRoutes) out.push(`ip route ${r.network} ${r.mask} ${r.nextHop}`);
  }
  out.push("end"); return out;
}

// ---------- L2 switch CLI ----------

function runSwitchCli(device: Device, raw: string, state: CliState, isL3: boolean): CliResult {
  const dev = clone(device);
  const cfg = dev.config as SwitchL3Config; // superset
  const out: string[] = [];
  let s = { ...state };
  const cmd = raw.trim();
  const parts = cmd.split(/\s+/);
  const p0 = parts[0]?.toLowerCase() ?? "";
  if (!cmd) return { output: [], state: s, device: dev };

  if (p0 === "end") { s = { mode: "enable" }; return { output: out, state: s, device: dev }; }
  if (p0 === "exit") {
    if (s.mode === "config-if" || s.mode === "config-vlan") s.mode = "config";
    else if (s.mode === "config") s.mode = "enable";
    else if (s.mode === "enable") s.mode = "user";
    return { output: out, state: s, device: dev };
  }

  if (s.mode === "user") {
    if (p0 === "enable" || cmd === "en") { s.mode = "enable"; return { output: out, state: s, device: dev }; }
    out.push(INVALID); return { output: out, state: s, device: dev };
  }
  if (s.mode === "enable") {
    if (cmd === "configure terminal" || cmd === "conf t" || cmd === "config t") { s.mode = "config"; out.push("Enter configuration commands, one per line.  End with CNTL/Z."); return { output: out, state: s, device: dev }; }
    if (p0 === "show") return runShow(dev, parts, s);
    if (p0 === "disable") { s.mode = "user"; return { output: out, state: s, device: dev }; }
    out.push(INVALID); return { output: out, state: s, device: dev };
  }
  if (s.mode === "config") {
    if (parts[0] === "hostname" && parts[1]) { cfg.hostname = parts[1]; dev.name = parts[1]; return { output: out, state: s, device: dev }; }
    if (parts[0] === "ip" && parts[1] === "routing") {
      if (!isL3) { out.push(INVALID); return { output: out, state: s, device: dev }; }
      cfg.ipRoutingEnabled = true;
      return { output: out, state: s, device: dev };
    }
    if (parts[0] === "vlan" && parts[1] && !isNaN(Number(parts[1]))) {
      const id = Number(parts[1]);
      if (!cfg.vlans[id]) cfg.vlans[id] = { id, name: `VLAN${String(id).padStart(4,"0")}` };
      s = { mode: "config-vlan", currentVlan: id };
      return { output: out, state: s, device: dev };
    }
    if (parts[0] === "interface" && parts[1]) {
      const rest = parts.slice(1).join("");
      // Vlan SVI on L3
      const svim = rest.toLowerCase().match(/^vlan(\d+)$/);
      if (svim && isL3) {
        const id = Number(svim[1]);
        if (!cfg.svis[id]) cfg.svis[id] = { vlanId: id, shutdown: false };
        s = { mode: "config-if", currentIface: `Vlan${id}` };
        return { output: out, state: s, device: dev };
      }
      const iname = normalizeIface(cfg, rest);
      if (!iname) { out.push(`% Unknown interface ${parts.slice(1).join(" ")}`); return { output: out, state: s, device: dev }; }
      s = { mode: "config-if", currentIface: iname };
      return { output: out, state: s, device: dev };
    }
    if (parts[0] === "ip" && parts[1] === "route" && isL3) {
      const [, , net, mask, nh] = parts;
      if (!net || !mask || !nh) { out.push("% Usage: ip route <net> <mask> <nh>"); return {output:out,state:s,device:dev}; }
      cfg.staticRoutes.push({ network: net, mask, nextHop: nh });
      return { output: out, state: s, device: dev };
    }
    out.push(INVALID); return { output: out, state: s, device: dev };
  }
  if (s.mode === "config-vlan") {
    if (parts[0] === "name" && parts[1]) { cfg.vlans[s.currentVlan!].name = parts.slice(1).join(" "); return { output: out, state: s, device: dev }; }
    out.push(INVALID); return { output: out, state: s, device: dev };
  }
  if (s.mode === "config-if") {
    // SVI case
    if (s.currentIface!.startsWith("Vlan") && isL3) {
      const id = Number(s.currentIface!.slice(4));
      const svi = cfg.svis[id];
      if (parts[0] === "ip" && parts[1] === "address" && parts[2] && parts[3]) {
        if (!isValidIp(parts[2]) || maskToInt(parts[3]) === null) { out.push("% Invalid ip/mask"); return { output: out, state: s, device: dev }; }
        svi.ip = parts[2]; svi.mask = parts[3]; return { output: out, state: s, device: dev };
      }
      if (cmd === "no shutdown") { svi.shutdown = false; return { output: out, state: s, device: dev }; }
      if (cmd === "shutdown") { svi.shutdown = true; return { output: out, state: s, device: dev }; }
      out.push(INVALID); return { output: out, state: s, device: dev };
    }
    const iface: SwitchInterface = cfg.interfaces[s.currentIface!];
    if (!iface) { s.mode = "config"; return { output: out, state: s, device: dev }; }
    if (parts[0] === "switchport" && parts[1] === "mode" && parts[2]) {
      if (parts[2] === "access") { iface.mode = "access"; iface.allowedVlans = undefined; }
      else if (parts[2] === "trunk") { iface.mode = "trunk"; }
      else out.push(INVALID);
      return { output: out, state: s, device: dev };
    }
    if (parts[0] === "switchport" && parts[1] === "access" && parts[2] === "vlan" && parts[3]) {
      const id = Number(parts[3]);
      if (!isNaN(id)) { iface.accessVlan = id; if (!cfg.vlans[id]) cfg.vlans[id] = { id, name: `VLAN${String(id).padStart(4,"0")}` }; }
      return { output: out, state: s, device: dev };
    }
    if (parts[0] === "switchport" && parts[1] === "trunk" && parts[2] === "allowed" && parts[3] === "vlan" && parts[4]) {
      iface.allowedVlans = parts[4].split(",").flatMap((tok) => {
        const m = tok.match(/^(\d+)-(\d+)$/);
        if (m) { const a=Number(m[1]),b=Number(m[2]); return Array.from({length:b-a+1},(_,i)=>a+i); }
        const n = Number(tok); return isNaN(n) ? [] : [n];
      });
      return { output: out, state: s, device: dev };
    }
    if (cmd === "no shutdown" || cmd === "no shut") { iface.shutdown = false; return { output: out, state: s, device: dev }; }
    if (cmd === "shutdown" || cmd === "shut") { iface.shutdown = true; return { output: out, state: s, device: dev }; }
    if (parts[0] === "description") return { output: out, state: s, device: dev };
    out.push(INVALID); return { output: out, state: s, device: dev };
  }
  out.push(INVALID); return { output: out, state: s, device: dev };
}

// ---------- PC CLI ----------

function runPcCli(device: Device, raw: string, state: CliState): CliResult {
  const dev = clone(device);
  const cfg = dev.config as PcConfig;
  const out: string[] = [];
  const cmd = raw.trim();
  const parts = cmd.split(/\s+/);
  const p0 = parts[0]?.toLowerCase() ?? "";

  if (!cmd) return { output: [], state, device: dev };
  if (p0 === "ipconfig") {
    if (parts[1] === "/all") {
      out.push(`Host Name . . . . . . . . . . . : ${cfg.hostname}`);
    }
    out.push("");
    out.push("Ethernet adapter eth0:");
    out.push(`   IPv4 Address. . . . . . . . . . . : ${cfg.ip ?? "unassigned"}`);
    out.push(`   Subnet Mask . . . . . . . . . . . : ${cfg.mask ?? "unassigned"}`);
    out.push(`   Default Gateway . . . . . . . . . : ${cfg.gateway ?? ""}`);
    return { output: out, state, device: dev };
  }
  if (p0 === "ip" && parts[1] === "address" && parts[2] && parts[3]) {
    if (!isValidIp(parts[2]) || maskToInt(parts[3]) === null) { out.push("Usage: ip address <ip> <mask> [gateway]"); return { output: out, state, device: dev }; }
    cfg.ip = parts[2]; cfg.mask = parts[3];
    if (parts[4] && isValidIp(parts[4])) cfg.gateway = parts[4];
    out.push(`Address set: ${cfg.ip}/${cfg.mask} gw=${cfg.gateway ?? "(none)"}`);
    return { output: out, state, device: dev };
  }
  if (p0 === "arp" && parts[1] === "-a") { out.push("(no dynamic entries — use ping to populate)"); return { output: out, state, device: dev }; }
  if (p0 === "help" || p0 === "?") { out.push("Commands: ipconfig, ipconfig /all, ip address <ip> <mask> [gw], arp -a. Use the Ping tool at the top to send traffic."); return {output:out,state,device:dev}; }
  out.push(`'${cmd}' is not recognized as an internal or external command.`);
  return { output: out, state, device: dev };
}

// ---------- Dispatcher ----------

export function runCommand(device: Device, cmd: string, state: CliState): CliResult {
  if (device.kind === "pc") return runPcCli(device, cmd, state);
  if (device.kind === "router") return runRouterCli(device, cmd, state);
  if (device.kind === "switchL2") return runSwitchCli(device, cmd, state, false);
  if (device.kind === "switchL3") return runSwitchCli(device, cmd, state, true);
  return { output: [INVALID], state, device };
}
