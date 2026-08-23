import { Link, createFileRoute } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";

import { useCart } from "@/lib/cart";
import { formatPKR, whatsappLink } from "@/lib/shop";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Bag — REX Thrift Store" },
      {
        name: "description",
        content: "Review the pairs in your bag and send the order straight to us on WhatsApp.",
      },
      { property: "og:title", content: "Your Bag — REX Thrift Store" },
      {
        property: "og:description",
        content: "Review your pairs and check out over WhatsApp.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, total, remove, clear } = useCart();

  const orderMessage =
    "Hi! I'd like to order:\n\n" +
    items.map((i) => `• ${i.title} (${i.size || "size n/a"}) — ${formatPKR(i.price)}`).join("\n") +
    `\n\nTotal: ${formatPKR(total)}`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-black uppercase">Your bag</h1>

      {items.length === 0 ? (
        <div className="mt-10 border border-border p-12 text-center">
          <p className="text-sm text-muted-foreground">Your bag is empty.</p>
          <Link
            to="/shop"
            className="label-caps mt-6 inline-block bg-foreground px-6 py-3 text-background"
          >
            Shop all pairs
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-10 divide-y divide-border border-y border-border">
            {items.map((item) => (
              <li
                key={item.id}
                className="grid grid-cols-[80px_minmax(0,1fr)_auto] items-center gap-4 py-4"
              >
                <div className="h-20 w-20 shrink-0 bg-secondary">
                  {item.image && (
                    <img src={item.image} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{item.title}</p>
                  <p className="label-caps text-muted-foreground">
                    {item.brand} · {item.size}
                  </p>
                  <p className="label-caps mt-1 text-muted-foreground/70">One of one</p>
                  <p className="mt-1 text-sm">{formatPKR(item.price)}</p>
                </div>
                <button
                  onClick={() => remove(item.id)}
                  className="grid h-9 w-9 shrink-0 place-items-center border border-border text-destructive"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-8 grid gap-6 sm:grid-cols-[minmax(0,1fr)_320px]">
            <button
              onClick={clear}
              className="label-caps self-start text-muted-foreground underline"
            >
              Clear bag
            </button>
            <div className="border border-border p-6">
              <div className="flex items-baseline justify-between">
                <span className="label-caps text-muted-foreground">Total</span>
                <span className="font-display text-2xl font-black">{formatPKR(total)}</span>
              </div>
              <a
                href={whatsappLink(orderMessage)}
                target="_blank"
                rel="noreferrer"
                className="label-caps mt-5 block bg-whatsapp px-6 py-4 text-center text-white transition-opacity hover:opacity-90"
              >
                Order on WhatsApp
              </a>
              <p className="mt-3 text-xs text-muted-foreground">
                We confirm stock, size and delivery on WhatsApp before payment.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
