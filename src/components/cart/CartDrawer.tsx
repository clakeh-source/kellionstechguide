import { Link } from "react-router-dom";
import { ShoppingBag, Minus, Plus, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/data/products";

export function CartDrawer() {
  const { isOpen, close, lines, subtotalCents, updateQty, removeItem } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(o) => (o ? null : close())}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><ShoppingBag className="h-5 w-5" /> Your cart</SheetTitle>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-16">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted">
              <ShoppingBag className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Button variant="outline" onClick={close} asChild>
              <Link to="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {lines.map((line) => (
                <div key={`${line.productSlug}:${line.tierId}`} className="flex gap-3 rounded-lg border border-border p-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{line.productName}</p>
                    <p className="text-xs text-muted-foreground">{line.tierName}</p>
                    <div className="mt-2 inline-flex items-center rounded-md border border-border">
                      <button
                        aria-label="Decrease quantity"
                        className="grid place-items-center h-7 w-7 hover:bg-muted"
                        onClick={() => updateQty(line.productSlug, line.tierId, line.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-sm tabular-nums">{line.quantity}</span>
                      <button
                        aria-label="Increase quantity"
                        className="grid place-items-center h-7 w-7 hover:bg-muted"
                        onClick={() => updateQty(line.productSlug, line.tierId, line.quantity + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      aria-label="Remove line"
                      className="text-muted-foreground hover:text-foreground"
                      onClick={() => removeItem(line.productSlug, line.tierId)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold tabular-nums">{formatPrice(line.lineTotalCents)}</span>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold tabular-nums">{formatPrice(subtotalCents)}</span>
              </div>
              <Button variant="forge" className="w-full" onClick={close} asChild>
                <Link to="/checkout">Review & checkout</Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground">Taxes calculated at checkout.</p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
