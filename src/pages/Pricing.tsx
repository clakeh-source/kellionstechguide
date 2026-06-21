import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["1 active track", "Daily lab access", "Community support", "30-day AI tutor trial"],
    cta: "Start free",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month",
    highlighted: true,
    features: ["All 4 tracks", "Unlimited labs", "Unlimited AI tutor", "Timed mock exams", "Progress analytics"],
    cta: "Go Pro",
    variant: "forge" as const,
  },
  {
    name: "Teams",
    price: "Custom",
    period: "",
    features: ["Everything in Pro", "Team progress dashboards", "SSO", "Dedicated success manager"],
    cta: "Contact sales",
    variant: "outline" as const,
  },
];

export default function Pricing() {
  return (
    <>
      <SEO title="Pricing — CertForge" description="Simple pricing for the CertForge learning hub. Free tier, Pro at $19/month, and Teams plans." />
      <section className="container py-16">
        <header className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <Badge variant="outline">Pricing</Badge>
          <h1 className="text-4xl font-display font-bold tracking-tight">Simple pricing</h1>
          <p className="text-muted-foreground">Start free. Upgrade when you're ready to forge faster.</p>
        </header>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <Card key={p.name} className={p.highlighted ? "border-primary shadow-glow" : ""}>
              <CardHeader>
                <CardTitle>{p.name}</CardTitle>
                <CardDescription>
                  <span className="text-3xl font-display font-bold text-foreground">{p.price}</span>
                  <span className="text-muted-foreground"> {p.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2"><Check className="h-4 w-4 text-success mt-0.5" /> {f}</li>
                  ))}
                </ul>
                <Button variant={p.variant} className="w-full" asChild>
                  <Link to={p.name === "Teams" ? "/contact" : "/auth?mode=signup"}>{p.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
