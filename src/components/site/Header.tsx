// src/components/site/Header.tsx

import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";

import { useCart } from "@/lib/cart";
import { STORE_NAME, whatsappLink } from "@/lib/shop";
import { Logo } from "./Logo";

const NAV = [
  { label: "Shop All", to: "/shop", search: undefined },
  { label: "Men", to: "/shop", search: { category: "men" } },
  { label: "Women", to: "/shop", search: { category: "women" } },
  { label: "Kids", to: "/shop", search: { category: "kids" } },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/15 bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-background/25 md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <Link to="/" className="inline-flex shrink-0 items-center">
          <Logo />
        </Link>

        <nav className="hidden min-w-0 items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search as never}
              className="label-caps inline-flex items-center text-background/70 transition-colors hover:text-background"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={whatsappLink("Hi! I want to order from " + STORE_NAME)}
            target="_blank"
            rel="noreferrer"
            className="label-caps hidden bg-whatsapp px-4 py-3 text-white transition-opacity hover:opacity-90 sm:inline-block"
          >
            Order on WhatsApp
          </a>
          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center border border-background/25 transition-colors hover:bg-background hover:text-foreground"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-2 -right-2 grid h-5 min-w-5 place-items-center bg-background px-1 text-[10px] font-bold text-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {open && (
        <nav className="border-t border-background/15 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search as never}
              onClick={() => setOpen(false)}
              className="label-caps block border-b border-background/10 px-4 py-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
