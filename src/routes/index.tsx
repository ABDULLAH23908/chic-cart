import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import heroImage from "@/assets/hero-sneakers.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import { ReviewsSection } from "@/components/site/ReviewsSection";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  STORE_NAME,
  orderForStorefront,
  whatsappLink,
  type Product,
} from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "REX Thrift Store — Branded Thrift Clothing in Rawalpindi" },
      {
        name: "description",
        content:
          "Hand-picked thrifted sneakers for men, women and kids. Real photos, honest condition grades, one clear price. Order on WhatsApp.",
      },
      { property: "og:title", content: "REX Thrift Store — Branded Thrift Clothing in Rawalpindi" },
      {
        property: "og:description",
        content:
          "Hand-picked thrifted sneakers with real photos and honest grading. Order on WhatsApp.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { data: products } = useQuery({
    queryKey: ["products", "home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(24);
      if (error) throw error;
      return orderForStorefront(data as Product[]);
    },
  });

  const all = products ?? [];
  const trending = all.filter((p) => p.featured).slice(0, 4);
  const trendingRow = (trending.length > 0 ? trending : all).slice(0, 4);
  const bestSellers = all.slice(4, 8);
  const newArrivals = all.slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border bg-foreground text-background">
        <img
          src={heroImage}
          alt="Branded thrift clothing rail"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 sm:py-32">
          <p className="label-caps text-background/60">{STORE_NAME}</p>
          <h1 className="mt-5 text-5xl leading-[0.95] font-black uppercase sm:text-7xl">
            Step into
            <br />
            your style
          </h1>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            {CATEGORIES.map((c) => (
              <Link
                key={c}
                to="/shop"
                search={{ category: c }}
                className="label-caps border border-background/40 px-6 py-4 transition-colors hover:bg-background hover:text-foreground"
              >
                Shop {c}
              </Link>
            ))}
            <a
              href={whatsappLink("Hi! I'm looking for a specific piece.")}
              target="_blank"
              rel="noreferrer"
              className="label-caps bg-whatsapp px-6 py-4 text-white transition-opacity hover:opacity-90"
            >
              Order on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* TRENDING NOW */}
      <ProductRow title="Trending now" items={trendingRow} />

      {/* SHOP BY CATEGORY */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-3xl font-black uppercase sm:text-4xl">Shop by category</h2>
        <div className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              to="/shop"
              search={{ category: c }}
              className="group flex items-center justify-between bg-card px-6 py-10 transition-colors hover:bg-foreground hover:text-background"
            >
              <span className="font-display text-2xl font-black uppercase">{c}</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <ProductRow title="Best sellers" items={bestSellers.length > 0 ? bestSellers : trendingRow} />

      {/* NEW ARRIVALS */}
      <ProductRow title="New arrivals" items={newArrivals} />

      {/* WHY SHOP WITH US */}
      <section className="mt-20 border-y border-border bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-3xl font-black uppercase">Why shop with us?</h2>
          <div className="mt-8 grid gap-px bg-border sm:grid-cols-3">
            {[
              { t: "Delivery", d: "Country-wide delivery, packed and shipped within 24 hours." },
              { t: "COD", d: "Cash on delivery available — pay when your parcel reaches you." },
              { t: "Exchanges", d: "Size or fit off? Message us on WhatsApp and we'll sort it." },
            ].map((f) => (
              <div key={f.t} className="bg-background p-8">
                <p className="label-caps">{f.t}</p>
                <p className="mt-3 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <ReviewsSection />
    </div>
  );
}

function ProductRow({ title, items }: { title: string; items: Product[] }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <h2 className="text-3xl font-black uppercase sm:text-4xl">{title}</h2>
        <Link to="/shop" className="label-caps shrink-0 underline">
          View all
        </Link>
      </div>

      {items.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="mt-8 border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Nothing listed here yet.
        </p>
      )}
    </section>
  );
}
