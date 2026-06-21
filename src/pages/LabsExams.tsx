import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { tracks } from "@/data/tracks";

export default function LabsExams() {
  return (
    <>
      <SEO title="Practice exams — CertForge" description="Timed practice exams for CCNA, JNCIA, and Fortinet certifications." />
      <section className="container py-16">
        <header className="max-w-2xl mb-12 space-y-3">
          <Badge variant="outline">Practice exams</Badge>
          <h1 className="text-4xl font-display font-bold tracking-tight">Timed practice exams</h1>
          <p className="text-muted-foreground">Blueprint-matched mock exams with weak-area analysis after every attempt.</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {tracks.map((t) => (
            <Card key={t.slug}>
              <CardHeader>
                <Badge variant={t.accent} className="w-fit">{t.vendor}</Badge>
                <CardTitle className="mt-2 text-lg">{t.title} mock exam</CardTitle>
                <CardDescription>~60 questions · 90 minutes</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">Sign in to launch your first attempt.</CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
