import type { Device, DeviceKind, Port, RouterConfig, SwitchL2Config, SwitchL3Config, PcConfig } from "../types";

let counter = 0;
export const uid = (prefix = "id") => `${prefix}_${Date.now().toString(36)}_${(++counter).toString(36)}`;

function routerPorts(): Port[] {
  return [
    { id: "Gi0/0", label: "Gi0/0" },
    { id: "Gi0/1", label: "Gi0/1" },
    { id: "Gi0/2", label: "Gi0/2" },
    { id: "Gi0/3", label: "Gi0/3" },
  ];
}
function switchPorts(): Port[] {
  return Array.from({ length: 8 }, (_, i) => ({ id: `Fa0/${i + 1}`, label: `Fa0/${i + 1}` }));
}
function pcPorts(): Port[] {
  return [{ id: "eth0", label: "eth0" }];
}

export function createDevice(kind: DeviceKind, x: number, y: number, existingNames: string[] = []): Device {
  const nextName = (base: string) => {
    let n = 1;
    while (existingNames.includes(`${base}${n}`)) n++;
    return `${base}${n}`;
  };

  if (kind === "router") {
    const name = nextName("R");
    const ports = routerPorts();
    const cfg: RouterConfig = {
      hostname: name,
      interfaces: Object.fromEntries(
        ports.map((p) => [p.id, { name: p.id, shutdown: true }]),
      ),
      staticRoutes: [],
    };
    return { id: uid("d"), kind, name, x, y, ports, config: cfg };
  }
  if (kind === "switchL2") {
    const name = nextName("SW");
    const ports = switchPorts();
    const cfg: SwitchL2Config = {
      hostname: name,
      vlans: { 1: { id: 1, name: "default" } },
      interfaces: Object.fromEntries(
        ports.map((p) => [p.id, { name: p.id, mode: "access", accessVlan: 1, shutdown: false }]),
      ),
    };
    return { id: uid("d"), kind, name, x, y, ports, config: cfg };
  }
  if (kind === "switchL3") {
    const name = nextName("MLS");
    const ports = switchPorts();
    const cfg: SwitchL3Config = {
      hostname: name,
      vlans: { 1: { id: 1, name: "default" } },
      interfaces: Object.fromEntries(
        ports.map((p) => [p.id, { name: p.id, mode: "access", accessVlan: 1, shutdown: false }]),
      ),
      ipRoutingEnabled: false,
      svis: {},
      staticRoutes: [],
    };
    return { id: uid("d"), kind, name, x, y, ports, config: cfg };
  }
  // pc
  const name = nextName("PC");
  const ports = pcPorts();
  const cfg: PcConfig = { hostname: name };
  return { id: uid("d"), kind: "pc", name, x, y, ports, config: cfg };
}
