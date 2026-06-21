import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const faqs = [
  { q: "Which certifications does CertForge cover?", a: "Cisco CCNA 200-301, Juniper JNCIA-Junos, Fortinet FCA/FCF, and Fortinet NSE 4 / FCP." },
  { q: "Are the labs vendor-accurate?", a: "Yes — Cisco labs use IOS syntax, Junos labs use Junos CLI hierarchy, and Fortinet labs include both GUI and CLI steps." },
  { q: "Do I need my own gear?", a: "No. Browser-based virtual labs cover most scenarios. Packet Tracer files are provided for topology practice." },
  { q: "Is there a free tier?", a: "Yes — one full track and daily labs are free, plus a 30-day AI tutor trial." },
];

export default function FAQ() {
  return (
    <>
      <SEO title="FAQ — CertForge" description="Frequently asked questions about CertForge tracks, labs, and pricing." />
      <section className="container py-16 max-w-3xl">
        <Badge variant="outline">FAQ</Badge>
        <h1 className="mt-3 text-4xl font-display font-bold tracking-tight">Frequently asked</h1>
        <div className="mt-8 space-y-4">
          {faqs.map((f) => (
            <Card key={f.q}>
              <CardHeader><CardTitle className="text-lg">{f.q}</CardTitle></CardHeader>
              <CardContent className="text-sm text-muted-foreground">{f.a}</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
