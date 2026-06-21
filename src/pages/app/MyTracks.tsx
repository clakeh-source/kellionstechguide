import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SEO } from "@/components/SEO";
import { tracks } from "@/data/tracks";

export default function MyTracks() {
  return (
    <>
      <SEO title="My tracks — CertForge" />
      <section className="container py-10 space-y-6">
        <h1 className="text-3xl font-display font-bold">My tracks</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {tracks.map((t, idx) => {
            const progress = [12, 0, 0, 0][idx] ?? 0;
            return (
              <Link key={t.slug} to={`/app/tracks/${t.slug}`}>
                <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-md">
                  <CardHeader>
                    <Badge variant={t.accent} className="w-fit">{t.vendor}</Badge>
                    <CardTitle className="mt-2">{t.title}</CardTitle>
                    <CardDescription>{t.exam}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-xs text-muted-foreground">{progress}% complete · {t.modules.length} modules</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
