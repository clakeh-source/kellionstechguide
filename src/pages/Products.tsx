import { Link } from "react-router-dom";
import { ArrowRight, Wrench } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { products, formatPrice } from "@/data/products";

export default function Products() {
  return (
    <>
      <SEO title="Products — CertForge" description="Cisco network simulator, practice exams, and guided practice labs — plus free networking tools." />
      <section className="container py-16">
        <header className="max-w-2xl mb-12 space-y-3">
          <Badge variant="outline">Products</Badge>
          <h1 className="text-4xl font-display font-bold tracking-tight">Products built for Cisco engineers</h1>
          <p className="text-muted-foreground">A simulator, question banks, and guided labs. All vendor-accurate. All Cisco-focused.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <Link key={p.slug} to={`/products/${p.slug}`} className="group">
              <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                      <p.icon className="h-5 w-5" />
                    </div>
                    <Badge variant={p.accent} className="w-fit">Cisco</Badge>
                  </div>
                  <CardTitle className="mt-3">{p.name}</CardTitle>
                  <CardDescription>{p.tagline}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{p.summary}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">From <span className="font-semibold text-foreground">{formatPrice(p.fromPriceCents)}</span></span>
                    <span className="text-sm font-medium text-primary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      View details <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          <Card className="h-full border-dashed">
            <CardHeader>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Wrench className="h-5 w-5" />
              </div>
              <CardTitle className="mt-3">Free Tools</CardTitle>
              <CardDescription>Subnet calculator, CLI cheat sheet, and a cert-path quiz — always free.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link to="/free-tools">Open free tools <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
