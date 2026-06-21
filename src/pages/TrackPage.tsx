import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Clock, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { tracksBySlug } from "@/data/tracks";

export default function TrackPage() {
  const { slug } = useParams();
  const track = slug ? tracksBySlug[slug] : undefined;
  if (!track) return <Navigate to="/tracks" replace />;

  return (
    <>
      <SEO
        title={`${track.title} — CertForge`}
        description={`${track.title}: ${track.tagline} Modules, hands-on labs, and a timed practice exam.`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: track.title,
          description: track.tagline,
          provider: { "@type": "Organization", name: "CertForge" },
        }}
      />
      <section className="bg-gradient-hero border-b">
        <div className="container py-16 grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Badge variant={track.accent}>{track.vendor} · Exam {track.exam}</Badge>
            <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">{track.title}</h1>
            <p className="text-lg text-muted-foreground">{track.tagline}</p>
            <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {track.duration}</span>
              <span className="flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> {track.modules.length} modules</span>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="forge" asChild><Link to="/auth?mode=signup">Start this track <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button variant="outline" asChild><Link to="/labs/practice-exams">Try a practice exam</Link></Button>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-2xl font-display font-bold mb-6">Curriculum</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {track.modules.map((m, idx) => (
            <Card key={m.title}>
              <CardHeader>
                <div className="text-xs text-muted-foreground">Module {idx + 1}</div>
                <CardTitle className="text-lg">{m.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {m.topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
