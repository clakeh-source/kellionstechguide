import type { Device, PingResult, Topology } from "./types";
import { createDevice } from "./engine/factory";

export interface LabDef {
  id: string;
  title: string;
  goal: string;
  locked: boolean; // requires product entitlement
  build: () => Topology;
  ping?: { fromDeviceName: string; toIp: string };
}

function newTopology(): Topology {
  return { devices: {}, links: {}, order: [] };
}

function place(topo: Topology, kind: Device["kind"], x: number, y: number, name?: string) {
  const existing = Object.values(topo.devices).map((d) => d.name);
  const dev = createDevice(kind, x, y, existing);
  if (name) { dev.name = name; (dev.config as any).hostname = name; }
  topo.devices[dev.id] = dev;
  topo.order.push(dev.id);
  return dev;
}

function cable(topo: Topology, a: Device, ap: string, b: Device, bp: string) {
  const id = `l_${a.id}_${ap}__${b.id}_${bp}`;
  topo.links[id] = { id, aDeviceId: a.id, aPortId: ap, bDeviceId: b.id, bPortId: bp };
}

export const labs: LabDef[] = [
  {
    id: "two-router-static",
    title: "Two routers, static routes",
    goal: "Configure IPs on both routers and PCs, add a static route on each router, then ping PC2 from PC1.",
    locked: false,
    build: () => {
      const t = newTopology();
      const pc1 = place(t, "pc", 80, 260, "PC1");
      const r1 = place(t, "router", 300, 260, "R1");
      const r2 = place(t, "router", 560, 260, "R2");
      const pc2 = place(t, "pc", 780, 260, "PC2");
      cable(t, pc1, "eth0", r1, "Gi0/0");
      cable(t, r1, "Gi0/1", r2, "Gi0/1");
      cable(t, r2, "Gi0/0", pc2, "eth0");
      return t;
    },
    ping: { fromDeviceName: "PC1", toIp: "192.168.2.10" },
  },
  {
    id: "vlan-trunk",
    title: "Two switches, VLAN + trunk",
    goal: "Create VLAN 10 on both switches, put PCs into VLAN 10, and configure the inter-switch link as a trunk.",
    locked: false,
    build: () => {
      const t = newTopology();
      const pc1 = place(t, "pc", 80, 200, "PC1");
      const sw1 = place(t, "switchL2", 300, 200, "SW1");
      const sw2 = place(t, "switchL2", 560, 200, "SW2");
      const pc2 = place(t, "pc", 780, 200, "PC2");
      cable(t, pc1, "eth0", sw1, "Fa0/1");
      cable(t, sw1, "Fa0/8", sw2, "Fa0/8");
      cable(t, sw2, "Fa0/1", pc2, "eth0");
      return t;
    },
    ping: { fromDeviceName: "PC1", toIp: "192.168.10.20" },
  },
  {
    id: "inter-vlan-routing",
    title: "Inter-VLAN routing on L3 switch",
    goal: "Configure two VLANs on the L3 switch, enable ip routing, add SVIs, and ping between VLANs.",
    locked: true,
    build: () => {
      const t = newTopology();
      const pc1 = place(t, "pc", 80, 140, "PC1");
      const pc2 = place(t, "pc", 80, 340, "PC2");
      const mls = place(t, "switchL3", 380, 240, "MLS1");
      cable(t, pc1, "eth0", mls, "Fa0/1");
      cable(t, pc2, "eth0", mls, "Fa0/2");
      return t;
    },
    ping: { fromDeviceName: "PC1", toIp: "10.0.20.10" },
  },
  { id: "empty-canvas", title: "Empty canvas", goal: "Free-build. Drop devices, wire them, configure everything from scratch.", locked: false, build: () => newTopology() },
  { id: "hub-and-spoke", title: "Hub-and-spoke (3 routers)", goal: "Configure a hub router with two spokes and static routes both ways.", locked: true, build: () => newTopology() },
  { id: "ospf-basic", title: "OSPF single area", goal: "Bring up OSPF area 0 between two routers (v1: static equivalent).", locked: true, build: () => newTopology() },
  { id: "acl-permit", title: "Named ACL (v2)", goal: "Coming in v2.", locked: true, build: () => newTopology() },
  { id: "nat-overload", title: "NAT overload (v2)", goal: "Coming in v2.", locked: true, build: () => newTopology() },
  { id: "dhcp-relay", title: "DHCP relay (v2)", goal: "Coming in v2.", locked: true, build: () => newTopology() },
  { id: "spanning-tree", title: "Spanning-tree lab (v2)", goal: "Coming in v2.", locked: true, build: () => newTopology() },
];
