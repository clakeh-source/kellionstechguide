import { useParams, Navigate } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/SEO";
import { tracksBySlug } from "@/data/tracks";

export default function MyTrack() {
  const { slug } = useParams();
  const track = slug ? tracksBySlug[slug] : undefined;
  if (!track) return <Navigate to="/app/tracks" replace />;

  return (
    <>
      <SEO title={`${track.title} — CertForge`} />
      <section className="container py-10 space-y-6">
        <div className="space-y-2">
          <Badge variant={track.accent}>{track.vendor} · {track.exam}</Badge>
          <h1 className="text-3xl font-display font-bold">{track.title}</h1>
          <p className="text-muted-foreground">{track.tagline}</p>
          <Progress value={12} className="max-w-md mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {track.modules.map((m, idx) => (
            <Card key={m.title}>
              <CardHeader>
                <div className="text-xs text-muted-foreground">Module {idx + 1}</div>
                <CardTitle className="text-lg">{m.title}</CardTitle>
                <CardDescription>{m.topics.length} topics</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {m.topics.map((topic, i) => {
                    const done = idx === 0 && i === 0;
                    const Icon = done ? CheckCircle2 : Circle;
                    return (
                      <li key={topic} className="flex items-start gap-2">
                        <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${done ? "text-success" : "text-muted-foreground"}`} />
                        <span className={done ? "line-through text-muted-foreground" : ""}>{topic}</span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
