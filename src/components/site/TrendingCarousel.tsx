import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { formatPKR, type Product } from "@/lib/shop";

/**
 * Revolving trending carousel: the middle card is the biggest and the
 * middle item keeps changing on its own.
 */
export function TrendingCarousel({ items }: { items: Product[] }) {
  const [active, setActive] = useState(0);
  const count = items.length;

  useEffect(() => {
    if (count < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % count), 3200);
    return () => clearInterval(id);
  }, [count]);

  if (count === 0) {
    return (
      <p className="mt-8 border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
        Nothing trending yet.
      </p>
    );
  }

  // three visible slots: previous, active (big), next
  const slots = [
    { p: items[(active - 1 + count) % count], role: "side" as const },
    { p: items[active], role: "center" as const },
    { p: items[(active + 1) % count], role: "side" as const },
  ];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-center gap-3 sm:gap-6">
        {slots.map(({ p, role }, i) => (
          <Link
            key={`${role}-${i}-${p.id}`}
            to="/product/$id"
            params={{ id: p.id }}
            className={
              "group relative block shrink-0 overflow-hidden border border-border bg-card transition-all duration-500 ease-out " +
              (role === "center"
                ? "z-10 w-[58%] scale-100 opacity-100 shadow-xl sm:w-[42%]"
                : "w-[21%] scale-90 opacity-60 hover:opacity-100 sm:w-[26%]")
            }
          >
            <div className="aspect-square w-full overflow-hidden bg-secondary">
              {p.images?.[0] && (
                <img
                  src={p.images[0]}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
            </div>
            {!p.in_stock && (
              <span className="label-caps absolute left-0 top-0 bg-foreground px-2 py-1 text-background">
                Sold
              </span>
            )}
            <div className={role === "center" ? "p-4" : "p-2"}>
              <p
                className={
                  "truncate font-bold uppercase " + (role === "center" ? "text-base" : "text-xs")
                }
              >
                {p.title}
              </p>
              <p className="label-caps truncate text-muted-foreground">
                {p.brand || p.category} {p.size ? `· ${p.size}` : ""}
              </p>
              <p className={role === "center" ? "mt-1 text-sm font-bold" : "text-xs font-bold"}>
                {formatPKR(p.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {items.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setActive(i)}
              aria-label={`Show ${p.title}`}
              className={
                "h-1.5 transition-all " +
                (i === active ? "w-8 bg-foreground" : "w-3 bg-border hover:bg-muted-foreground")
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
