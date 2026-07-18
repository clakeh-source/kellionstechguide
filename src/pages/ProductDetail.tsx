import { useMemo, useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { Check, ShoppingCart, ArrowLeft, PlayCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { productsBySlug, ProductSlug, formatPrice } from "@/data/products";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const product = slug ? productsBySlug[slug as ProductSlug] : undefined;
  const { addItem } = useCart();
  const defaultTierId = useMemo(() => product?.tiers.find((t) => t.highlighted)?.id ?? product?.tiers[0]?.id, [product]);
  const [selectedTierId, setSelectedTierId] = useState<string | undefined>(defaultTierId);

  if (!product) return <Navigate to="/products" replace />;

  const Icon = product.icon;
  const selectedTier = product.tiers.find((t) => t.id === selectedTierId) ?? product.tiers[0];

  return (
    <>
      <SEO title={`${product.name} — CertForge`} description={product.summary} />
      <section className="container py-10">
        <Link to="/products" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> All products
        </Link>
      </section>

      <section className="container pb-16 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-8">
          <header className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Icon className="h-6 w-6" />
              </div>
              <Badge variant={product.accent}>Cisco</Badge>
            </div>
            <h1 className="text-4xl font-display font-bold tracking-tight">{product.name}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">{product.tagline}</p>
          </header>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's included</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-2 sm:grid-cols-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 mt-0.5 text-success" /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {product.details.map((d) => (
              <Card key={d.heading}>
                <CardHeader><CardTitle className="text-base">{d.heading}</CardTitle></CardHeader>
                <CardContent className="text-sm text-muted-foreground">{d.body}</CardContent>
              </Card>
            ))}
          </div>

          {product.slug === "cisco-practice-exams" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sample question preview</CardTitle>
                <CardDescription>One question from the CCNA bank — no signup needed.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="font-medium">Which command displays the status and configuration of all interfaces on a Cisco router in a summary table?</p>
                <ol className="space-y-1.5 pl-5 list-[upper-alpha] text-muted-foreground">
                  <li>show interfaces detail</li>
                  <li>show ip interface brief</li>
                  <li>show running-config interfaces</li>
                  <li>show version</li>
                </ol>
                <details className="text-muted-foreground">
                  <summary className="cursor-pointer text-primary font-medium">Reveal answer</summary>
                  <p className="mt-2"><b className="text-foreground">B.</b> <code className="font-mono">show ip interface brief</code> lists interfaces, IP addresses, status, and protocol in one summary table.</p>
                </details>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 h-fit">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Choose a plan</CardTitle>
              <CardDescription>One-time purchase. Lifetime access to this release.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {product.tiers.map((tier) => {
                const active = tier.id === selectedTierId;
                return (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTierId(tier.id)}
                    className={cn(
                      "w-full text-left rounded-lg border p-3 transition-all",
                      active ? "border-primary ring-2 ring-primary/30 bg-accent/40" : "border-border hover:border-primary/40"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{tier.name}</p>
                        <p className="text-xs text-muted-foreground">{tier.description}</p>
                      </div>
                      <span className="text-lg font-display font-bold tabular-nums">{formatPrice(tier.priceCents)}</span>
                    </div>
                    {tier.highlighted && <Badge variant="outline" className="mt-2 border-primary/40 text-primary">Most popular</Badge>}
                  </button>
                );
              })}

              <Button
                variant="forge"
                size="lg"
                className="w-full"
                onClick={() => selectedTier && addItem(product.slug, selectedTier.id)}
              >
                <ShoppingCart className="h-4 w-4" /> Add to cart — {selectedTier && formatPrice(selectedTier.priceCents)}
              </Button>
              <p className="text-xs text-muted-foreground text-center">Instant access after checkout.</p>
            </CardContent>
          </Card>
        </aside>
      </section>
    </>
  );
}
