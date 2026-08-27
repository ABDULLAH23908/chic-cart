import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, ChevronLeft, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ZoomImage } from "@/components/site/ZoomImage";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { formatPKR, type Product } from "@/lib/shop";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Sneaker Detail — Prime Shoes" },
      {
        name: "description",
        content:
          "See the exact thrifted pair: real photos with magnifying zoom, size, condition grade and price.",
      },
      { property: "og:title", content: "Sneaker Detail — Prime Shoes" },
      {
        property: "og:description",
        content: "Real photos with zoom, honest grading and one clear price.",
      },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { add, has } = useCart();
  const [index, setIndex] = useState(0);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as Product | null;
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2">
        <div className="aspect-square animate-pulse bg-secondary" />
        <div className="space-y-4">
          <div className="h-8 w-3/4 animate-pulse bg-secondary" />
          <div className="h-6 w-1/3 animate-pulse bg-secondary" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="text-3xl font-black uppercase">Pair not found</h1>
        <Link to="/shop" className="label-caps mt-6 inline-block underline">
          Back to all pairs
        </Link>
      </div>
    );
  }

  const images = product.images.length > 0 ? product.images : [];
  const inBag = has(product.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Link
        to="/shop"
        className="label-caps inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Back to all pairs
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <div className="space-y-3">
          {images[index] ? (
            <ZoomImage src={images[index]} alt={product.title} />
          ) : (
            <div className="label-caps grid aspect-square place-items-center border border-border bg-secondary text-muted-foreground">
              No photo
            </div>
          )}
          {images.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  onClick={() => setIndex(i)}
                  className={
                    "h-20 w-20 border-2 " + (i === index ? "border-foreground" : "border-border")
                  }
                  aria-label={`Photo ${i + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="label-caps text-muted-foreground">
            {product.brand || "Thrift"} · {product.category}
          </p>
          <h1 className="mt-3 text-3xl font-black uppercase sm:text-4xl">{product.title}</h1>

          <p className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-3xl font-black">{formatPKR(product.price)}</span>
            {product.original_price ? (
              <span className="text-sm text-muted-foreground line-through">
                {product.original_price}
              </span>
            ) : null}
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-px border border-border bg-border">
            <Spec label="Size" value={product.size || "—"} />
            <Spec label="Condition" value={product.condition} />
            <Spec label="Brand" value={product.brand || "—"} />
            <Spec label="Availability" value={product.in_stock ? "In stock" : "Sold"} />
          </dl>
          <p className="label-caps mt-3 text-muted-foreground/70">
            One of one — this exact piece, not a reprint or restock.
          </p>

          {product.description && (
            <p className="mt-6 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
              {product.description}
            </p>
          )}

          <div className="mt-8 grid gap-3">
            <button
              disabled={!product.in_stock || inBag}
              onClick={() => {
                const added = add({
                  id: product.id,
                  title: product.title,
                  brand: product.brand,
                  size: product.size,
                  price: product.price,
                  image: images[0] ?? null,
                });
                if (added) toast.success("Added to your bag");
              }}
              className="label-caps inline-flex items-center justify-center gap-2 bg-foreground px-6 py-4 text-background transition-opacity hover:opacity-85 disabled:opacity-40"
            >
              {inBag ? (
                <>
                  <Check className="h-4 w-4" /> In your bag
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> Add to bag
                </>
              )}
            </button>
            <a
              href={whatsappLink(
                `Hi! I want to order:\n${product.title}\nSize: ${product.size}\nCondition: ${product.condition}\nPrice: ${formatPKR(product.price)}`,
              )}
              target="_blank"
              rel="noreferrer"
              className="label-caps bg-whatsapp px-6 py-4 text-center text-white transition-opacity hover:opacity-90"
            >
              Order on WhatsApp
            </a>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Hover the photo on desktop or press and drag on mobile to magnify the details.
          </p>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-4">
      <dt className="label-caps text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}
