import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";

export default function About() {
  return (
    <>
      <SEO title="About — CertForge" description="CertForge is built by working network engineers for engineers chasing Cisco, Juniper, and Fortinet certifications." />
      <section className="container py-16 max-w-3xl">
        <Badge variant="outline">About</Badge>
        <h1 className="mt-3 text-4xl font-display font-bold tracking-tight">Built by engineers, for engineers.</h1>
        <div className="prose mt-6 text-muted-foreground space-y-4">
          <p>CertForge is a focused learning hub for the three vendors that dominate enterprise networking: Cisco, Juniper, and Fortinet. We don't try to teach everything — we teach the exams that hire.</p>
          <p>Every lab is written by someone who's racked the gear and run the commands. Every practice question is mapped to the official blueprint. No fluff.</p>
        </div>
      </section>
    </>
  );
}
