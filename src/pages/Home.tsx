import { Link } from "react-router-dom";
import { ArrowRight, FlaskConical, BrainCircuit, Sparkles, ShieldCheck, Flame, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { tracks } from "@/data/tracks";

export default function Home() {
  return (
    <>
      <SEO
        title="CertForge — Forge your networking certifications"
        description="The modern learning hub for Cisco CCNA, Juniper JNCIA, and Fortinet certifications. Hands-on labs, practice exams, AI-guided study."
      />

      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container py-20 md:py-28 grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-6 animate-slide-up">
            <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/5 text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Now training on 4 vendor tracks
            </Badge>
            <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight leading-[1.05]">
              Forge your <span className="bg-gradient-forge bg-clip-text text-transparent">networking</span> certifications.
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              CertForge is the focused learning hub for <b>Cisco CCNA</b>, <b>Juniper JNCIA</b>, and <b>Fortinet</b> engineers. Hands-on labs, real CLI practice, and AI-guided study — built by network engineers, for network engineers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="forge" size="lg" asChild>
                <Link to="/auth?mode=signup">Start free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/tracks">Browse tracks</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> Vendor-accurate</span>
              <span className="flex items-center gap-1.5"><Terminal className="h-4 w-4 text-cisco" /> Real CLI</span>
              <span className="flex items-center gap-1.5"><BrainCircuit className="h-4 w-4 text-primary" /> AI tutor</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-forge opacity-20 blur-3xl rounded-full" />
            <Card className="relative shadow-lg border-border/60 overflow-hidden">
              <div className="bg-slate-950 px-4 py-3 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs text-slate-400 font-mono">CertForge CLI</span>
              </div>
              <pre className="bg-slate-950 text-slate-100 p-5 text-sm font-mono leading-relaxed overflow-x-auto">
{`R1> enable
R1# configure terminal
R1(config)# router ospf 1
R1(config-router)# network 10.0.0.0 0.255.255.255 area 0
R1(config-router)# end
R1# show ip ospf neighbor

Neighbor ID     Pri   State        Dead Time   Address
2.2.2.2           1   FULL/DR      00:00:38    10.0.0.2`}
              </pre>
            </Card>
          </div>
        </div>
      </section>

      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-display font-bold">Pick your certification path</h2>
          <p className="text-muted-foreground">Structured modules, hands-on labs, and timed practice exams for the certs that hire.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {tracks.map((t) => (
            <Link key={t.slug} to={`/tracks/${t.slug}`} className="group">
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <Badge variant={t.accent} className="w-fit">{t.vendor}</Badge>
                  <CardTitle className="mt-3">{t.title}</CardTitle>
                  <CardDescription>{t.exam} · {t.duration}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.tagline}</p>
                  <p className="mt-4 text-sm font-medium text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    View track <ArrowRight className="h-4 w-4" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="container py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: FlaskConical, title: "Hands-on labs", body: "Real CLI scenarios that mirror the actual exam blueprint — no toy simulators." },
            { icon: Flame, title: "Adaptive practice", body: "Weak-area drills, timed mock exams, and spaced repetition built in." },
            { icon: BrainCircuit, title: "AI vendor tutor", body: "Ask CertForge AI for Cisco, Juniper, or Fortinet help — vendor-accurate, no mixing." },
          ].map((f) => (
            <Card key={f.title}>
              <CardHeader>
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3 text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{f.body}</CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-20">
        <Card className="bg-gradient-forge border-0 text-primary-foreground overflow-hidden relative">
          <CardContent className="p-12 grid gap-6 md:grid-cols-2 items-center">
            <div className="space-y-3">
              <h2 className="text-3xl font-display font-bold">Start forging today.</h2>
              <p className="opacity-90">Free tier includes one full track, daily labs, and unlimited AI tutoring for the first 30 days.</p>
            </div>
            <div className="md:justify-self-end">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/auth?mode=signup">Create your free account <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
