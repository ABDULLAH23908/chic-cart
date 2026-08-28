// src/components/site/Header.tsx

import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { useCart } from "@/lib/cart";
import { Logo } from "./Logo";

type NavItem = {
  label: string;
  to: "/shop";
  search: { category?: string; q?: string };
};

const NAV: NavItem[] = [
  { label: "Shop All", to: "/shop", search: {} },
  { label: "Men", to: "/shop", search: { category: "men" } },
  { label: "Women", to: "/shop", search: { category: "women" } },
  { label: "Unisex", to: "/shop", search: { category: "unisex" } },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const submitSearch = (e?: FormEvent) => {
    e?.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate({ to: "/shop", search: { q } });
    setSearchOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/15 bg-foreground text-background">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-background/70 transition-colors hover:text-background md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link to="/" className="inline-flex shrink-0 items-center">
          <Logo />
        </Link>

        <nav className="hidden min-w-0 items-center gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search}
              className="label-caps inline-flex items-center text-background/70 transition-colors hover:text-background"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <form
            onSubmit={submitSearch}
            className="group hidden items-center md:flex"
          >
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search..."
              className="h-10 w-0 border-b border-transparent bg-transparent px-0 text-sm text-background opacity-0 transition-all duration-300 ease-out placeholder:text-background/40 focus:outline-none group-focus-within:w-40 group-focus-within:border-background/40 group-focus-within:px-2 group-focus-within:opacity-100 group-hover:w-40 group-hover:border-background/40 group-hover:px-2 group-hover:opacity-100 lg:group-focus-within:w-56 lg:group-hover:w-56"
            />
            <button
              type="submit"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-background/70 transition-colors hover:text-background"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <button
            onClick={() => setSearchOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center text-background/70 transition-colors hover:text-background md:hidden"
            aria-label="Toggle search"
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>

          <Link
            to="/cart"
            className="relative inline-flex h-10 w-10 items-center justify-center text-background/70 transition-colors hover:text-background"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-background px-1 text-[10px] font-bold text-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="border-t border-background/15 px-4 py-3 md:hidden">
          <div className="flex items-center gap-2 border-b border-background/25">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              autoFocus
              className="h-10 flex-1 bg-transparent px-1 text-sm text-background placeholder:text-background/40 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-background/70 transition-colors hover:text-background"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </div>
        </form>
      )}

      {open && (
        <nav className="border-t border-background/15 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              search={item.search}
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
