export const WHATSAPP_NUMBER = "923335129333";
export const WHATSAPP_DISPLAY = "+92 333 5129333";
export const STORE_NAME = "REX THRIFT STORE";
export const STORE_SHORT_NAME = "REX";
export const STORE_TAGLINE = "Shop Smart · Shop Rex";
export const STORE_ADDRESS = "Shop LG 56, Emirates Plaza, Bahria Town Phase 7, Rawalpindi, Pakistan";
export const STORE_MAPS_LINK =
  "https://www.google.com/maps/search/?api=1&query=" +
  encodeURIComponent("REX Thrift Store Emirates Plaza Bahria Town Phase 7 Rawalpindi");
export const STORE_RATING = "5.0";


export const CATEGORIES = ["men", "women", "kids"] as const;
export const CONDITIONS = ["Premium+", "Premium", "Excellence", "Very Good"] as const;

export type Product = {
  id: string;
  title: string;
  brand: string;
  category: string;
  size: string;
  condition: string;
  price: number;
  original_price: number | null;
  description: string;
  images: string[];
  in_stock: boolean;
  featured: boolean;
  sold_at: string | null;
  created_at: string;
};

export function formatPKR(value: number) {
  return "PKR " + new Intl.NumberFormat("en-PK").format(value);
}

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const SOLD_VISIBLE_MS = 24 * 60 * 60 * 1000;

/** A sold pair stays listed (at the very end) for 24h, then disappears. */
export function isHiddenSold(p: Pick<Product, "in_stock" | "sold_at">) {
  if (p.in_stock) return false;
  if (!p.sold_at) return false;
  return Date.now() - new Date(p.sold_at).getTime() > SOLD_VISIBLE_MS;
}

/** Drops expired sold pairs and pushes remaining sold pairs to the end. */
export function orderForStorefront<T extends Pick<Product, "in_stock" | "sold_at">>(list: T[]) {
  return list
    .filter((p) => !isHiddenSold(p))
    .sort((a, b) => Number(a.in_stock === false) - Number(b.in_stock === false));
}

export function soldHoursLeft(sold_at: string | null) {
  if (!sold_at) return 0;
  const left = SOLD_VISIBLE_MS - (Date.now() - new Date(sold_at).getTime());
  return Math.max(0, Math.ceil(left / (60 * 60 * 1000)));
}
