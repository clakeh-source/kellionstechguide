import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function LabsVirtual() {
  return (
    <>
      <SEO title="Virtual labs — CertForge" description="Browser-based CLI labs for Cisco, Juniper, and Fortinet." />
      <section className="container py-16">
        <header className="max-w-2xl mb-12 space-y-3">
          <Badge variant="outline">Virtual labs</Badge>
          <h1 className="text-4xl font-display font-bold tracking-tight">Virtual CLI labs</h1>
          <p className="text-muted-foreground">Spin up vendor-accurate terminals and complete guided scenarios. Coming soon: live grading and AI hints.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {["Cisco IOS basics", "Junos commit & rollback", "FortiGate firewall policy"].map((t) => (
            <Card key={t}>
              <CardHeader>
                <CardTitle className="text-lg">{t}</CardTitle>
                <CardDescription>Guided scenario · ~20 min</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Available once you start your track.</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
