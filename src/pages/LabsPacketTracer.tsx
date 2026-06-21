import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function LabsPacketTracer() {
  return (
    <>
      <SEO title="Packet Tracer labs — CertForge" description="Topology-driven Packet Tracer labs for CCNA." />
      <section className="container py-16">
        <header className="max-w-2xl mb-12 space-y-3">
          <Badge variant="outline">Packet Tracer</Badge>
          <h1 className="text-4xl font-display font-bold tracking-tight">Packet Tracer labs</h1>
          <p className="text-muted-foreground">Download `.pkt` files with step-by-step instructions and verification checklists.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {["VLANs & trunking", "OSPF single-area", "ACLs & NAT", "FHRP with HSRP"].map((t) => (
            <Card key={t}>
              <CardHeader>
                <CardTitle className="text-lg">{t}</CardTitle>
                <CardDescription>CCNA · Packet Tracer 8+</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Lab files publish with the CCNA track launch.</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
