import { SEO } from "@/components/SEO";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function MyNotes() {
  return (
    <>
      <SEO title="Notes — CertForge" />
      <section className="container py-10 space-y-6">
        <h1 className="text-3xl font-display font-bold">Notes</h1>
        <Card>
          <CardHeader><CardTitle className="text-lg">Your study notes</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">Notebook UI coming next — capture commands, configs, and explanations per topic.</CardContent>
        </Card>
      </section>
    </>
  );
}
