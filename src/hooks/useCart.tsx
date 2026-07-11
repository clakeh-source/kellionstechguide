import { createContext, useContext, useEffect, useMemo, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { products, productsBySlug, ProductSlug } from "@/data/products";

export interface CartItem {
  productSlug: ProductSlug;
  tierId: string;
  quantity: number;
}

interface CartLine extends CartItem {
  productName: string;
  tierName: string;
  unitPriceCents: number;
  lineTotalCents: number;
}

interface CartContextValue {
  items: CartItem[];
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  addItem: (productSlug: ProductSlug, tierId: string, quantity?: number) => void;
  removeItem: (productSlug: ProductSlug, tierId: string) => void;
  updateQty: (productSlug: ProductSlug, tierId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = "certforge:cart:v1";

function loadInitial(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i) => i && productsBySlug[i.productSlug as ProductSlug] && typeof i.tierId === "string" && typeof i.quantity === "number"
    );
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadInitial);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota */
    }
  }, [items]);

  const addItem = useCallback((productSlug: ProductSlug, tierId: string, quantity = 1) => {
    const product = productsBySlug[productSlug];
    const tier = product?.tiers.find((t) => t.id === tierId);
    if (!product || !tier) return;

    setItems((prev) => {
      const existing = prev.find((i) => i.productSlug === productSlug && i.tierId === tierId);
      if (existing) {
        return prev.map((i) =>
          i.productSlug === productSlug && i.tierId === tierId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { productSlug, tierId, quantity }];
    });
    toast.success(`Added to cart — ${product.name}`, { description: tier.name });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productSlug: ProductSlug, tierId: string) => {
    setItems((prev) => prev.filter((i) => !(i.productSlug === productSlug && i.tierId === tierId)));
  }, []);

  const updateQty = useCallback((productSlug: ProductSlug, tierId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => !(i.productSlug === productSlug && i.tierId === tierId)));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productSlug === productSlug && i.tierId === tierId ? { ...i, quantity } : i))
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const lines: CartLine[] = items.flatMap((item) => {
      const product = productsBySlug[item.productSlug];
      const tier = product?.tiers.find((t) => t.id === item.tierId);
      if (!product || !tier) return [];
      return [{
        ...item,
        productName: product.name,
        tierName: tier.name,
        unitPriceCents: tier.priceCents,
        lineTotalCents: tier.priceCents * item.quantity,
      }];
    });
    const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
    const count = lines.reduce((sum, l) => sum + l.quantity, 0);
    return {
      items,
      lines,
      count,
      subtotalCents,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      addItem,
      removeItem,
      updateQty,
      clear,
    };
  }, [items, isOpen, addItem, removeItem, updateQty, clear]);

  // Reference products import to avoid tree-shaking of validation set
  void products;

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
