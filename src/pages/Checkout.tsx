import { Link } from "react-router-dom";
import { ArrowLeft, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SEO } from "@/components/SEO";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/data/products";
import { toast } from "sonner";

export default function Checkout() {
  const { lines, subtotalCents, clear } = useCart();

  return (
    <>
      <SEO title="Checkout — CertForge" description="Review your order and complete checkout." />
      <section className="container py-10">
        <Link to="/products" className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Continue shopping
        </Link>
      </section>

      <section className="container pb-16 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Order summary</CardTitle></CardHeader>
          <CardContent>
            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground">Your cart is empty. <Link to="/products" className="text-primary underline">Browse products</Link>.</p>
            ) : (
              <ul className="divide-y divide-border">
                {lines.map((l) => (
                  <li key={`${l.productSlug}:${l.tierId}`} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{l.productName}</p>
                      <p className="text-xs text-muted-foreground">{l.tierName} · Qty {l.quantity}</p>
                    </div>
                    <span className="text-sm font-semibold tabular-nums">{formatPrice(l.lineTotalCents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{formatPrice(subtotalCents)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estimated tax</span><span className="tabular-nums text-muted-foreground">—</span></div>
            <Separator />
            <div className="flex justify-between text-base font-semibold"><span>Total</span><span className="tabular-nums">{formatPrice(subtotalCents)}</span></div>

            <Button
              variant="forge"
              className="w-full"
              size="lg"
              disabled={lines.length === 0}
              onClick={() => {
                toast.success("Order placed", { description: "Payments are coming online in the next release — no card was charged." });
                clear();
              }}
            >
              <Lock className="h-4 w-4" /> Place order
            </Button>
            <p className="text-xs text-muted-foreground text-center">Secure checkout. We never store card details.</p>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
