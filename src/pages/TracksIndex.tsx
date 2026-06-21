import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { tracks } from "@/data/tracks";

export default function TracksIndex() {
  return (
    <>
      <SEO title="Certification tracks — CertForge" description="Cisco CCNA, Juniper JNCIA, Fortinet FCA & NSE 4 — pick your networking certification path." />
      <section className="container py-16">
        <header className="max-w-2xl mb-12 space-y-3">
          <Badge variant="outline">All tracks</Badge>
          <h1 className="text-4xl font-display font-bold tracking-tight">Certification tracks</h1>
          <p className="text-muted-foreground">Choose the vendor and exam that fits your career path. Every track ships with modules, labs, and a timed practice exam.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-2">
          {tracks.map((t) => (
            <Link key={t.slug} to={`/tracks/${t.slug}`} className="group">
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant={t.accent}>{t.vendor}</Badge>
                    <span className="text-xs text-muted-foreground">{t.duration}</span>
                  </div>
                  <CardTitle className="mt-3">{t.title}</CardTitle>
                  <CardDescription>Exam {t.exam}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.tagline}</p>
                  <p className="mt-3 text-xs text-muted-foreground">{t.modules.length} modules</p>
                  <p className="mt-4 text-sm font-medium text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explore track <ArrowRight className="h-4 w-4" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
