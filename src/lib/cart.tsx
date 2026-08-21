import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  title: string;
  brand: string;
  size: string;
  price: number;
  image: string | null;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  total: number;
  /** Adds the item. Returns false (and does nothing) if it's already in the bag —
   *  every listing is a single physical piece, so it can only be added once. */
  add: (item: CartItem) => boolean;
  has: (id: string) => boolean;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tl-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as (CartItem & { qty?: number })[];
      // Drop any leftover "qty" from older carts saved before single-unit items.
      setItems(parsed.map(({ qty: _qty, ...item }) => item));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);

  const has = useCallback((id: string) => items.some((p) => p.id === id), [items]);

  const add = useCallback((item: CartItem) => {
    let added = true;
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) {
        added = false;
        return prev;
      }
      return [...prev, item];
    });
    return added;
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.length,
      total: items.reduce((n, i) => n + i.price, 0),
      add,
      has,
      remove,
      clear,
    }),
    [items, add, has, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
