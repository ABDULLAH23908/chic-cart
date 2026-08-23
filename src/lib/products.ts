/**
 * BULK PRODUCT MANAGEMENT
 * -----------------------
 * Edit the list below to add many products at once, then press
 * "Import bulk list" in the admin panel — every row is inserted into the store.
 *
 * Rules:
 *  - category must be one of: men | women | kids
 *  - condition must be one of: Premium+ | Premium | Excellence | Very Good
 *  - price / original_price are plain numbers in PKR
 *  - images are full https URLs (paste links, or upload photos in the form instead)
 */
import { CATEGORIES, CONDITIONS } from "./shop";

export type BulkProduct = {
  title: string;
  brand?: string;
  category?: (typeof CATEGORIES)[number];
  size?: string;
  condition?: (typeof CONDITIONS)[number];
  price: number;
  original_price?: number | null;
  description?: string;
  images?: string[];
  in_stock?: boolean;
  featured?: boolean;
};

export const BULK_PRODUCTS: BulkProduct[] = [
  // {
  //   title: "Adidas Originals Track Jacket",
  //   brand: "Adidas",
  //   category: "men",
  //   size: "M",
  //   condition: "Premium",
  //   price: 2500,
  //   original_price: 6000,
  //   description: "Clean three-stripe jacket, no flaws.",
  //   images: [],
  //   in_stock: true,
  //   featured: false,
  // },
];

/** Normalises a bulk row into a database-ready product row. */
export function toProductRow(p: BulkProduct) {
  return {
    title: p.title.trim(),
    brand: (p.brand ?? "").trim(),
    category: p.category ?? "men",
    size: (p.size ?? "").trim(),
    condition: p.condition ?? "Premium",
    price: Number(p.price) || 0,
    original_price: p.original_price ?? null,
    description: (p.description ?? "").trim(),
    images: p.images ?? [],
    in_stock: p.in_stock ?? true,
    featured: p.featured ?? false,
  };
}

export function toProductRows(list: BulkProduct[] = BULK_PRODUCTS) {
  return list.filter((p) => p.title?.trim()).map(toProductRow);
}
