import { SEO } from "@/components/SEO";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function MyLabs() {
  return (
    <>
      <SEO title="My labs — CertForge" />
      <section className="container py-10 space-y-6">
        <h1 className="text-3xl font-display font-bold">Labs</h1>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { v: "cisco" as const, n: "Cisco · VLANs & trunking" },
            { v: "juniper" as const, n: "Junos · commit & rollback" },
            { v: "fortinet" as const, n: "FortiGate · firewall policy" },
          ].map((l) => (
            <Card key={l.n}>
              <CardHeader>
                <Badge variant={l.v} className="w-fit">{l.v}</Badge>
                <CardTitle className="mt-2 text-lg">{l.n}</CardTitle>
                <CardDescription>Guided · ~20 min</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Lab engine launches here.</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
