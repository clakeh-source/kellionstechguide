import { SEO } from "@/components/SEO";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { tracks } from "@/data/tracks";

export default function MyProgress() {
  return (
    <>
      <SEO title="Progress — CertForge" />
      <section className="container py-10 space-y-6">
        <h1 className="text-3xl font-display font-bold">Progress</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {tracks.map((t, idx) => {
            const progress = [12, 0, 0, 0][idx] ?? 0;
            return (
              <Card key={t.slug}>
                <CardHeader>
                  <Badge variant={t.accent} className="w-fit">{t.vendor}</Badge>
                  <CardTitle className="mt-2 text-lg">{t.title}</CardTitle>
                  <CardDescription>{progress}% complete</CardDescription>
                </CardHeader>
                <CardContent><Progress value={progress} /></CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
