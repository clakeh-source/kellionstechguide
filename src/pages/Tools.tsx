import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Network, Calculator, Gauge, Server, BarChart3, FileText, Cpu } from "lucide-react";

const tools = [
  { icon: Calculator, name: "Subnet Calculator", desc: "IPv4 / IPv6 / VLSM / supernet." },
  { icon: Network, name: "Cisco CLI Assistant", desc: "Generate and verify IOS configs." },
  { icon: Gauge, name: "SmartSpeed Pro", desc: "Real-world speed and jitter testing." },
  { icon: Server, name: "Atlas Asset Manager", desc: "Inventory and lifecycle for network gear." },
  { icon: BarChart3, name: "SmartNet Dashboards", desc: "Live network health dashboards." },
  { icon: FileText, name: "SmartNet Reports", desc: "Scheduled monitoring reports." },
  { icon: Cpu, name: "SmartNet Sensors", desc: "Sensor configuration and thresholds." },
];

export default function Tools() {
  return (
    <>
      <SEO title="Tools — CertForge" description="Free networking tools for engineers: subnetting, CLI assistant, speed testing, monitoring, and more." />
      <section className="container py-16">
        <header className="max-w-2xl mb-12 space-y-3">
          <Badge variant="outline">Tools</Badge>
          <h1 className="text-4xl font-display font-bold tracking-tight">Tools for working engineers</h1>
          <p className="text-muted-foreground">Free utilities that pair with your learning track.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((t) => (
            <Card key={t.name}>
              <CardHeader>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <t.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3 text-lg">{t.name}</CardTitle>
                <CardDescription>{t.desc}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Coming back online in the next release.</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
