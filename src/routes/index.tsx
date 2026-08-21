import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import heroImage from "@/assets/hero-sneakers.jpg";
import { ProductCard } from "@/components/site/ProductCard";
import { ReviewsSection } from "@/components/site/ReviewsSection";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIES,
  CONDITIONS,
  STORE_NAME,
  orderForStorefront,
  whatsappLink,
  type Product,
} from "@/lib/shop";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Thrift Locker — Thrifted Sneakers, Graded Honestly" },
      {
        name: "description",
        content:
          "Hand-picked thrifted sneakers for men, women and kids. Real photos, honest condition grades, one clear price. Order on WhatsApp.",
      },
      { property: "og:title", content: "Thrift Locker — Thrifted Sneakers, Graded Honestly" },
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
        .limit(12);
      if (error) throw error;
      return orderForStorefront(data as Product[]).slice(0, 6);
    },
  });

  return (
    <div>
      <section className="relative overflow-hidden border-b border-border bg-foreground text-background">
        <img
          src={heroImage}
          alt="Worn vintage sneakers on concrete"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="label-caps text-background/60">100+ brands · one thrift stop</p>
          <h1 className="mt-5 max-w-3xl text-5xl leading-[0.95] font-black uppercase sm:text-7xl">
            Worn once.
            <br />
            Priced right.
          </h1>
          <p className="mt-6 max-w-lg text-sm text-background/70">
            Every pair at {STORE_NAME} is inspected, graded and photographed by hand. What you see is
            the exact pair that lands at your door.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="label-caps inline-flex items-center gap-2 bg-background px-6 py-4 text-foreground transition-opacity hover:opacity-85"
            >
              Shop new arrivals <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href={whatsappLink("Hi! I'm looking for a specific pair.")}
              target="_blank"
              rel="noreferrer"
              className="label-caps bg-whatsapp px-6 py-4 text-white transition-opacity hover:opacity-90"
            >
              Order on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-px border border-border bg-border sm:grid-cols-3">
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

      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <h2 className="text-3xl font-black uppercase sm:text-4xl">New arrivals</h2>
          <Link to="/shop" className="label-caps shrink-0 underline">
            View all
          </Link>
        </div>

        {products && products.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <p className="mt-8 border border-dashed border-border py-20 text-center text-sm text-muted-foreground">
            No pairs listed yet. Add your first product from the admin panel.
          </p>
        )}
      </section>

      <section className="mt-20 border-y border-border bg-secondary">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-3xl font-black uppercase">Shop by condition</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We grade every pair the same way, so you always know what you're paying for.
          </p>
          <div className="mt-8 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {CONDITIONS.map((c) => (
              <Link
                key={c}
                to="/shop"
                search={{ condition: c }}
                className="bg-background p-6 transition-colors hover:bg-foreground hover:text-background"
              >
                <p className="label-caps">{c}</p>
                <p className="mt-3 text-xs opacity-70">
                  {c === "Premium+"
                    ? "Looks brand new. Barely worn, no visible flaws."
                    : c === "Premium"
                      ? "Light signs of wear, crisp shape and clean sole."
                      : c === "Excellence"
                        ? "Honest wear with plenty of life left in them."
                        : "Well loved pairs at the friendliest prices."}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ReviewsSection />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 border border-border p-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <h2 className="text-2xl font-black uppercase">Looking for a specific pair?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Message us your size and budget — we source it from the next bale.
            </p>
          </div>
          <a
            href={whatsappLink("Hi! I'm looking for size ___ and my budget is ___")}
            target="_blank"
            rel="noreferrer"
            className="label-caps shrink-0 bg-whatsapp px-6 py-4 text-center text-white"
          >
            Chat with us
          </a>
        </div>
      </section>
    </div>
  );
}
