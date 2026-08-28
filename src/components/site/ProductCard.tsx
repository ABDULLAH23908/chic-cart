import { Link } from "@tanstack/react-router";
import { Check, ShoppingBag } from "lucide-react";

import { useCart } from "@/lib/cart";
import { formatPKR, type Product } from "@/lib/shop";

export function ProductCard({ product }: { product: Product }) {
  const { add, has } = useCart();
  const image = product.images[0] ?? null;
  const inBag = has(product.id);

  return (
    <article className="group flex flex-col border border-border bg-card">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="relative block aspect-square overflow-hidden bg-secondary"
      >
        {image ? (
          <img
            src={image}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="label-caps grid h-full place-items-center text-muted-foreground">
            No photo
          </span>
        )}
        <span className="label-caps absolute top-0 left-0 bg-foreground px-2 py-1 text-background">
          {product.condition}
        </span>
        {!product.in_stock && (
          <span className="label-caps absolute inset-0 grid place-items-center bg-background/80">
            Sold
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="label-caps text-muted-foreground">
          {product.brand || "Thrift"} · {product.category}
        </p>
        <Link to="/product/$id" params={{ id: product.id }} className="min-w-0">
          <h3 className="text-sm leading-tight font-bold">{product.title}</h3>
        </Link>
        <p className="text-xs text-muted-foreground">{product.size}</p>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-base font-black">{formatPKR(product.price)}</span>
          {product.original_price ? (
            <span className="text-xs text-muted-foreground line-through">
              {product.original_price}
            </span>
          ) : null}
        </p>
      </div>

      <div className="grid gap-px border-t border-border">
        <button
          disabled={!product.in_stock || inBag}
          onClick={() =>
            add({
              id: product.id,
              title: product.title,
              brand: product.brand,
              size: product.size,
              price: product.price,
              image,
            })
          }
          className="label-caps inline-flex items-center justify-center gap-2 bg-foreground px-3 py-3 text-background transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {inBag ? (
            <>
              <Check className="h-3.5 w-3.5" /> In your bag
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" /> Add to bag
            </>
          )}
        </button>
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="label-caps bg-card px-3 py-3 text-center transition-colors hover:bg-secondary"
        >
          View details
        </Link>
      </div>
    </article>
  );
}
