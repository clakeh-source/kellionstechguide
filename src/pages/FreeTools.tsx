import { Link } from "react-router-dom";
import { ArrowRight, Calculator, BookOpen, Compass } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

const tools = [
  { to: "/free-tools/subnet-calculator", icon: Calculator, title: "Subnet Calculator", desc: "IPv4 subnetting made simple — mask, hosts, broadcast, and range." },
  { to: "/free-tools/cli-cheat-sheet", icon: BookOpen, title: "Cisco CLI Cheat Sheet", desc: "The commands you actually reach for on lab day. Searchable, printable." },
  { to: "/free-tools/cert-path-quiz", icon: Compass, title: "Certification Path Quiz", desc: "Five quick questions. One clear next-cert recommendation." },
];

export default function FreeTools() {
  return (
    <>
      <SEO title="Free Tools — CertForge" description="Free networking tools: subnet calculator, Cisco CLI cheat sheet, and a certification path quiz." />
      <section className="container py-16">
        <header className="max-w-2xl mb-12 space-y-3">
          <Badge variant="outline">Free tools</Badge>
          <h1 className="text-4xl font-display font-bold tracking-tight">Free networking tools</h1>
          <p className="text-muted-foreground">No signup, no cart, no catch. Small utilities that pair well with your study routine.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {tools.map((t) => (
            <Link key={t.to} to={t.to} className="group">
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <t.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="mt-3">{t.title}</CardTitle>
                  <CardDescription>{t.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm font-medium text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Open tool <ArrowRight className="h-4 w-4" />
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
