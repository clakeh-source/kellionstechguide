import { Link } from "react-router-dom";
import { FlaskConical, Network, FileQuestion, ArrowRight, Cpu } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

const sections = [
  { to: "/labs/virtual", icon: FlaskConical, title: "Virtual labs", desc: "CLI scenarios across Cisco, Juniper, and Fortinet — practice in your browser." },
  { to: "/labs/simulator", icon: Cpu, title: "Cisco Network Simulator", desc: "Drag-and-drop routers, switches, and PCs. Configure IOS and watch packet flow." },
  { to: "/labs/packet-tracer", icon: Network, title: "Packet Tracer labs", desc: "Topology-driven labs with step-by-step instructions and verification." },
  { to: "/labs/practice-exams", icon: FileQuestion, title: "Practice exams", desc: "Timed mock exams that mirror the real blueprint, with weak-area analysis." },
];

export default function Labs() {
  return (
    <>
      <SEO title="Labs — CertForge" description="Hands-on networking labs: virtual CLI, Packet Tracer scenarios, and timed practice exams." />
      <section className="container py-16">
        <header className="max-w-2xl mb-12 space-y-3">
          <Badge variant="outline">Labs</Badge>
          <h1 className="text-4xl font-display font-bold tracking-tight">Hands-on practice that builds real skill</h1>
          <p className="text-muted-foreground">Four lab modes, vendor-accurate, mapped to every track.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {sections.map((s) => (
            <Link key={s.to} to={s.to} className="group">
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-3">{s.title}</CardTitle>
                  <CardDescription>{s.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open <ArrowRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
