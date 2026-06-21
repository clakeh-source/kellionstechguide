import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useAuth } from "@/hooks/useAuth";
import { tracks } from "@/data/tracks";

export default function Dashboard() {
  const { user } = useAuth();
  const name = user?.email?.split("@")[0] ?? "engineer";
  return (
    <>
      <SEO title="Dashboard — CertForge" />
      <section className="container py-10 space-y-10">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-3xl font-display font-bold capitalize">{name}</h1>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Continue learning</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {tracks.map((t, idx) => {
              const progress = [12, 0, 0, 0][idx] ?? 0;
              return (
                <Card key={t.slug}>
                  <CardHeader>
                    <Badge variant={t.accent} className="w-fit">{t.vendor}</Badge>
                    <CardTitle className="mt-2 text-base">{t.title}</CardTitle>
                    <CardDescription>{t.exam}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={progress} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{progress}% complete</span>
                      <Link to={`/app/tracks/${t.slug}`} className="font-medium text-primary inline-flex items-center gap-1">Open <ArrowRight className="h-3 w-3" /></Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent labs</CardTitle>
              <CardDescription>Your last lab attempts will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              No labs completed yet.
              <Button variant="link" asChild className="px-1"><Link to="/app/labs">Browse labs</Link></Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="outline" asChild><Link to="/app/exams">Start practice exam</Link></Button>
              <Button variant="outline" asChild><Link to="/app/notes">Open notes</Link></Button>
              <Button variant="outline" asChild><Link to="/app/tools">Tools</Link></Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
