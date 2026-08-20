import { Link } from "@tanstack/react-router";

import { STORE_NAME, WHATSAPP_DISPLAY, whatsappLink } from "@/lib/shop";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <p className="font-display text-xl font-black tracking-[0.2em] uppercase">{STORE_NAME}</p>
          <p className="mt-4 max-w-xs text-sm text-background/60">
            Hand-picked thrifted pairs, graded honestly and priced fairly. One pair, one owner, one
            price.
          </p>
        </div>

        <div>
          <p className="label-caps text-background/50">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/shop" className="hover:underline">
                All pairs
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "men" }} className="hover:underline">
                Men
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "women" }} className="hover:underline">
                Women
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ category: "kids" }} className="hover:underline">
                Kids
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="label-caps text-background/50">Grades</p>
          <ul className="mt-4 space-y-2 text-sm text-background/70">
            <li>Premium+ — looks brand new</li>
            <li>Premium — light signs of wear</li>
            <li>Excellence — honest wear, lots left</li>
            <li>Very Good — well loved, best price</li>
          </ul>
        </div>

        <div>
          <p className="label-caps text-background/50">Contact</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={whatsappLink("Hi! I have a question about a pair.")}
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                WhatsApp {WHATSAPP_DISPLAY}
              </a>
            </li>
            <li className="text-background/70">Open daily · closes 8:00 PM</li>
            <li>
              <Link to="/admin" className="text-background/50 hover:underline">
                Admin panel
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-background/15 py-6 text-center text-xs text-background/50">
        © {new Date().getFullYear()} {STORE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
