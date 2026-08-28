import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";

import { ProductCard } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { BRANDS, CATEGORIES, orderForStorefront, type Product } from "@/lib/shop";

type ShopSearch = {
  category?: string | undefined;
  brand?: string | undefined;
  sort?: string | undefined;
  q?: string | undefined;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search["category"] === "string" ? search["category"] : undefined,
    brand: typeof search["brand"] === "string" ? search["brand"] : undefined,
    sort: typeof search["sort"] === "string" ? search["sort"] : undefined,
    q: typeof search["q"] === "string" ? search["q"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Shop All Shoes — Prime Shoes" },
      {
        name: "description",
        content: "Browse every pair in stock: filter by men, women, unisex and price.",
      },
      { property: "og:title", content: "Shop All Shoes — Prime Shoes" },
      {
        property: "og:description",
        content: "Filter shoes by category and price.",
      },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { category, brand, sort } = Route.useSearch();

  const { data, isLoading } = useQuery({
    queryKey: ["products", category, brand, sort],
    queryFn: async () => {
      let query = supabase.from("products").select("*");
      if (category) query = query.eq("category", category);
      if (brand) query = query.ilike("brand", brand);
      if (sort === "price-asc") query = query.order("price", { ascending: true });
      else if (sort === "price-desc") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });
      const { data, error } = await query;
      if (error) throw error;
      return orderForStorefront(data as Product[]);
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-black uppercase sm:text-5xl">
        {category || brand || "Shop all"}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Fresh pairs, photographed by hand. What you see is exactly what lands at your door.
      </p>

      <div className="mt-8 space-y-4 border-y border-border py-5">
        <FilterRow label="Category">
          <FilterChip to={{ brand, sort }} active={!category} label="All" />
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c}
              to={{ category: c, brand, sort }}
              active={category === c}
              label={c}
            />
          ))}
        </FilterRow>
        <FilterRow label="Brand">
          <FilterChip to={{ category, sort }} active={!brand} label="All" />
          {BRANDS.map((b) => (
            <FilterChip
              key={b}
              to={{ category, brand: b, sort }}
              active={brand === b}
              label={b}
            />
          ))}
        </FilterRow>
        <FilterRow label="Sort">
          <FilterChip to={{ category, brand }} active={!sort} label="Newest" />
          <FilterChip
            to={{ category, brand, sort: "price-asc" }}
            active={sort === "price-asc"}
            label="Price low → high"
          />
          <FilterChip
            to={{ category, brand, sort: "price-desc" }}
            active={sort === "price-desc"}
            label="Price high → low"
          />
        </FilterRow>
      </div>

      {isLoading ? (
        <div className="grid gap-5 py-16 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="aspect-square animate-pulse bg-secondary" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="py-24 text-center text-sm text-muted-foreground">
          No pairs match this filter yet.
        </p>
      )}
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[110px_minmax(0,1fr)] sm:items-center">
      <p className="label-caps text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  to,
  active,
  label,
}: {
  to: ShopSearch;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      to="/shop"
      search={to}
      className={
        "label-caps border px-3 py-2 transition-colors " +
        (active
          ? "border-foreground bg-foreground text-background"
          : "border-border hover:border-foreground")
      }
    >
      {label}
    </Link>
  );
}
