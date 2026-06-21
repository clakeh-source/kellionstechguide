import { SEO } from "@/components/SEO";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { tracks } from "@/data/tracks";

export default function MyExams() {
  return (
    <>
      <SEO title="Practice exams — CertForge" />
      <section className="container py-10 space-y-6">
        <h1 className="text-3xl font-display font-bold">Practice exams</h1>
        <div className="grid gap-4 md:grid-cols-2">
          {tracks.map((t) => (
            <Card key={t.slug}>
              <CardHeader>
                <Badge variant={t.accent} className="w-fit">{t.vendor}</Badge>
                <CardTitle className="mt-2 text-lg">{t.title} mock exam</CardTitle>
                <CardDescription>~60 questions · 90 minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="forge">Start attempt</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
