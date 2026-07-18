// Small IPv4 helpers — no external deps.

export function ipToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    const v = Number(p);
    if (!Number.isInteger(v) || v < 0 || v > 255) return null;
    n = (n << 8) + v;
  }
  return n >>> 0;
}

export function maskToInt(mask: string): number | null {
  // accepts dotted-decimal or prefix "/24"
  if (mask.startsWith("/")) {
    const p = Number(mask.slice(1));
    if (!Number.isInteger(p) || p < 0 || p > 32) return null;
    return p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
  }
  return ipToInt(mask);
}

export function isValidIp(ip: string): boolean {
  return ipToInt(ip) !== null;
}

export function sameSubnet(ipA: string, mask: string, ipB: string): boolean {
  const a = ipToInt(ipA);
  const b = ipToInt(ipB);
  const m = maskToInt(mask);
  if (a === null || b === null || m === null) return false;
  return (a & m) === (b & m);
}

export function inNetwork(ip: string, network: string, mask: string): boolean {
  const a = ipToInt(ip);
  const n = ipToInt(network);
  const m = maskToInt(mask);
  if (a === null || n === null || m === null) return false;
  return (a & m) === (n & m);
}

export function prefixOf(mask: string): number {
  const m = maskToInt(mask);
  if (m === null) return 0;
  let count = 0;
  let x = m;
  while (x & 0x80000000) { count++; x = (x << 1) >>> 0; }
  return count;
}
