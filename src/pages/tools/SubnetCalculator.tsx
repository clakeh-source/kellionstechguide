import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

function parseIPv4(ip: string): number | null {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d+$/.test(p)) return null;
    const v = Number(p);
    if (v < 0 || v > 255) return null;
    n = (n << 8) + v;
  }
  return n >>> 0;
}

function toIPv4(n: number): string {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}

function maskFromPrefix(prefix: number): number {
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

function classify(n: number): string {
  const first = (n >>> 24) & 255;
  if (first >= 1 && first <= 126) return "Class A";
  if (first >= 128 && first <= 191) return "Class B";
  if (first >= 192 && first <= 223) return "Class C";
  if (first >= 224 && first <= 239) return "Class D (multicast)";
  return "Class E (reserved)";
}

interface Result {
  network: string;
  broadcast: string;
  mask: string;
  wildcard: string;
  firstHost: string;
  lastHost: string;
  usableHosts: number;
  totalAddresses: number;
  classLabel: string;
  isPrivate: boolean;
}

export default function SubnetCalculator() {
  const [ip, setIp] = useState("192.168.1.10");
  const [prefix, setPrefix] = useState("24");

  const result = useMemo<Result | { error: string } | null>(() => {
    const ipNum = parseIPv4(ip);
    if (ipNum === null) return { error: "Enter a valid IPv4 address (e.g. 192.168.1.10)." };
    const pNum = Number(prefix);
    if (!/^\d+$/.test(prefix) || pNum < 0 || pNum > 32) return { error: "Prefix must be between 0 and 32." };

    const mask = maskFromPrefix(pNum);
    const network = (ipNum & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const total = pNum === 32 ? 1 : 2 ** (32 - pNum);
    const usable = pNum >= 31 ? 0 : Math.max(0, total - 2);
    const first = pNum >= 31 ? network : (network + 1) >>> 0;
    const last = pNum >= 31 ? broadcast : (broadcast - 1) >>> 0;

    const firstOctet = (ipNum >>> 24) & 255;
    const secondOctet = (ipNum >>> 16) & 255;
    const isPrivate =
      firstOctet === 10 ||
      (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) ||
      (firstOctet === 192 && secondOctet === 168);

    return {
      network: toIPv4(network),
      broadcast: toIPv4(broadcast),
      mask: toIPv4(mask),
      wildcard: toIPv4((~mask) >>> 0),
      firstHost: toIPv4(first),
      lastHost: toIPv4(last),
      usableHosts: usable,
      totalAddresses: total,
      classLabel: classify(ipNum),
      isPrivate,
    };
  }, [ip, prefix]);

  return (
    <>
      <SEO title="Subnet Calculator — Free Tools — CertForge" description="Free IPv4 subnet calculator: network, broadcast, mask, wildcard, first/last host, and usable host count." />
      <section className="container py-10">
        <Link to="/free-tools" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All free tools
        </Link>
      </section>
      <section className="container pb-16 space-y-8 max-w-3xl">
        <header className="space-y-3">
          <Badge variant="outline">Free tool</Badge>
          <h1 className="text-3xl font-display font-bold tracking-tight">IPv4 Subnet Calculator</h1>
          <p className="text-muted-foreground">Type an IP address and a CIDR prefix. Everything else calculates instantly.</p>
        </header>

        <Card>
          <CardHeader><CardTitle className="text-lg">Input</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-[2fr_1fr]">
            <div className="space-y-1.5">
              <Label htmlFor="ip">IP address</Label>
              <Input id="ip" value={ip} onChange={(e) => setIp(e.target.value)} placeholder="192.168.1.10" className="font-mono" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prefix">CIDR prefix (/0–/32)</Label>
              <Input id="prefix" value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="24" inputMode="numeric" className="font-mono" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Result</CardTitle>
            <CardDescription>Calculated from {ip}/{prefix}</CardDescription>
          </CardHeader>
          <CardContent>
            {!result ? null : "error" in result ? (
              <p className="text-sm text-destructive">{result.error}</p>
            ) : (
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                <Row label="Network address" value={result.network} />
                <Row label="Broadcast address" value={result.broadcast} />
                <Row label="Subnet mask" value={result.mask} />
                <Row label="Wildcard mask" value={result.wildcard} />
                <Row label="First usable host" value={result.firstHost} />
                <Row label="Last usable host" value={result.lastHost} />
                <Row label="Usable hosts" value={result.usableHosts.toLocaleString()} />
                <Row label="Total addresses" value={result.totalAddresses.toLocaleString()} />
                <Row label="Address class" value={result.classLabel} />
                <Row label="Scope" value={result.isPrivate ? "Private (RFC 1918)" : "Public"} />
              </dl>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono font-medium">{value}</dd>
    </div>
  );
}
