export type DeviceKind = "router" | "switchL2" | "switchL3" | "pc";

export interface Port {
  id: string;         // e.g. "Gi0/0", "Fa0/1", "eth0"
  label: string;      // short label shown on canvas
}

export interface RouterInterface {
  name: string;
  ip?: string;        // e.g. "10.0.0.1"
  mask?: string;      // e.g. "255.255.255.0"
  shutdown: boolean;
}

export interface StaticRoute {
  network: string;    // e.g. "192.168.2.0"
  mask: string;
  nextHop: string;
}

export interface RouterConfig {
  hostname: string;
  interfaces: Record<string, RouterInterface>;
  staticRoutes: StaticRoute[];
}

export interface SwitchInterface {
  name: string;
  mode: "access" | "trunk";
  accessVlan?: number;
  allowedVlans?: number[]; // trunk allowed
  shutdown: boolean;
}

export interface Svi {
  vlanId: number;
  ip?: string;
  mask?: string;
  shutdown: boolean;
}

export interface Vlan {
  id: number;
  name: string;
}

export interface SwitchL2Config {
  hostname: string;
  vlans: Record<number, Vlan>;
  interfaces: Record<string, SwitchInterface>;
}

export interface SwitchL3Config extends SwitchL2Config {
  ipRoutingEnabled: boolean;
  svis: Record<number, Svi>;
  staticRoutes: StaticRoute[];
}

export interface PcConfig {
  hostname: string;
  ip?: string;
  mask?: string;
  gateway?: string;
}

export type DeviceConfig = RouterConfig | SwitchL2Config | SwitchL3Config | PcConfig;

export interface Device {
  id: string;
  kind: DeviceKind;
  name: string;
  x: number;
  y: number;
  ports: Port[];
  config: DeviceConfig;
}

export interface Link {
  id: string;
  aDeviceId: string;
  aPortId: string;
  bDeviceId: string;
  bPortId: string;
}

export interface Topology {
  devices: Record<string, Device>;
  links: Record<string, Link>;
  order: string[];       // z-order for devices
}

export interface PathHop {
  deviceId: string;
  ingressPortId?: string;
  egressPortId?: string;
  note?: string;
}

export interface PingResult {
  ok: boolean;
  path: PathHop[];
  reason?: string;
}
