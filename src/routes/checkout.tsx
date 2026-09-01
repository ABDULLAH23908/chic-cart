import { Link, createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useCart } from "@/lib/cart";
import {
  PAYMENT_METHODS,
  placeOrder,
  readReceiptFile,
  type PaymentMethodId,
} from "@/lib/orders";
import { formatPKR } from "@/lib/shop";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Prime Shoes" },
      {
        name: "description",
        content:
          "Place your order with cash on delivery, JazzCash, Easypaisa or bank transfer and attach your payment receipt.",
      },
      { property: "og:title", content: "Checkout — Prime Shoes" },
      {
        property: "og:description",
        content: "Cash on delivery or online transfer with receipt upload.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutPage,
});

const inputClass =
  "w-full border border-border bg-background px-3 py-3 text-sm outline-none focus:border-foreground";

function CheckoutPage() {
  const { items, total, clear } = useCart();
  const [method, setMethod] = useState<PaymentMethodId>("cod");
  const [form, setForm] = useState({
    customer_name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
    payment_reference: "",
  });
  const [receipt, setReceipt] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const selected = PAYMENT_METHODS.find((m) => m.id === method)!;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim()) {
      toast.error("Add your full name");
      return;
    }
    if (form.phone.trim().length < 6) {
      toast.error("Add a phone number we can reach");
      return;
    }
    if (form.address.trim().length < 5) {
      toast.error("Add your delivery address");
      return;
    }
    if (selected.requiresReceipt && !receipt) {
      toast.error("Attach your payment receipt screenshot");
      return;
    }

    setSubmitting(true);
    try {
      const id = await placeOrder({
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        notes: form.notes.trim(),
        payment_method: method,
        payment_reference: form.payment_reference.trim(),
        receipt_image: receipt,
        items,
      });
      setOrderId(id);
      clear();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not place the order");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <span className="mx-auto grid h-14 w-14 place-items-center bg-foreground text-background">
          <Check className="h-6 w-6" />
        </span>
        <h1 className="mt-6 text-3xl font-black uppercase">Order placed</h1>
        <p className="label-caps mt-3 text-muted-foreground">
          Order #{orderId.slice(0, 8).toUpperCase()}
        </p>
        <p className="mt-4 text-sm text-muted-foreground">
          We’re verifying your order now. Once the payment is confirmed the pair is reserved for
          you and marked sold in the store. We’ll contact you on {form.phone || "your number"} for
          delivery.
        </p>
        <Link
          to="/shop"
          className="label-caps mt-8 inline-block bg-foreground px-6 py-4 text-background"
        >
          Keep shopping
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <h1 className="text-3xl font-black uppercase">Nothing to check out</h1>
        <p className="mt-3 text-sm text-muted-foreground">Your bag is empty.</p>
        <Link
          to="/shop"
          className="label-caps mt-6 inline-block bg-foreground px-6 py-3 text-background"
        >
          Shop all pairs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-black uppercase">Checkout</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Cash on delivery or online transfer — attach your receipt and we verify it before dispatch.
      </p>

      <form onSubmit={onSubmit} className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-8">
          <section className="space-y-4 border border-border p-6">
            <h2 className="text-xl font-black uppercase">Delivery details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name *">
                <input
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  maxLength={80}
                  className={inputClass}
                />
              </Field>
              <Field label="Phone / WhatsApp *">
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  maxLength={30}
                  placeholder="03xx xxxxxxx"
                  className={inputClass}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={255}
                  className={inputClass}
                />
              </Field>
              <Field label="City">
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  maxLength={80}
                  className={inputClass}
                />
              </Field>
            </div>
            <Field label="Full address *">
              <textarea
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                rows={3}
                maxLength={400}
                className={inputClass}
              />
            </Field>
            <Field label="Order notes">
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
                maxLength={1000}
                className={inputClass}
              />
            </Field>
          </section>

          <section className="space-y-4 border border-border p-6">
            <h2 className="text-xl font-black uppercase">Payment</h2>
            <div className="grid gap-px bg-border sm:grid-cols-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={
                    "p-4 text-left transition-colors " +
                    (method === m.id
                      ? "bg-foreground text-background"
                      : "bg-card hover:bg-secondary")
                  }
                >
                  <span className="label-caps block">{m.label}</span>
                  <span className="mt-1 block text-xs opacity-70">{m.blurb}</span>
                </button>
              ))}
            </div>

            {selected.account && (
              <div className="border border-border bg-secondary p-4 sm:flex sm:items-center sm:gap-5">
                {selected.qr && (
                  <img
                    src={selected.qr}
                    alt={`${selected.account.title} QR code for ${selected.account.holder}`}
                    className="mb-4 w-40 border border-border bg-background p-2 sm:mb-0"
                  />
                )}
                <div>
                  <p className="label-caps text-muted-foreground">{selected.account.title}</p>
                  <p className="font-display text-xl font-black">{selected.account.number}</p>
                  {selected.account.iban && (
                    <p className="text-xs text-muted-foreground">IBAN: {selected.account.iban}</p>
                  )}
                  {selected.account.branch && (
                    <p className="text-xs text-muted-foreground">
                      Branch: {selected.account.branch}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Account title: {selected.account.holder} · Send exactly {formatPKR(total)}
                  </p>
                </div>
              </div>
            )}

            {selected.requiresReceipt && (
              <>
                <Field label="Transaction ID / reference">
                  <input
                    value={form.payment_reference}
                    onChange={(e) => setForm({ ...form, payment_reference: e.target.value })}
                    maxLength={120}
                    className={inputClass}
                  />
                </Field>
                <Field label="Payment receipt screenshot *">
                  <label className="label-caps flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border py-6 text-muted-foreground hover:border-foreground">
                    <Upload className="h-4 w-4" /> Attach receipt
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          setReceipt(await readReceiptFile(file));
                        } catch {
                          toast.error("Could not read that image");
                        }
                      }}
                    />
                  </label>
                </Field>
                {receipt && (
                  <div className="relative inline-block border border-border">
                    <img src={receipt} alt="Payment receipt" className="max-h-56" />
                    <button
                      type="button"
                      onClick={() => setReceipt(null)}
                      className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center bg-foreground text-background"
                      aria-label="Remove receipt"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        <aside className="h-fit border border-border p-6">
          <h2 className="text-xl font-black uppercase">Your order</h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {items.map((i) => (
              <li key={i.id} className="flex items-center gap-3 py-3">
                <div className="h-14 w-14 shrink-0 bg-secondary">
                  {i.image && <img src={i.image} alt="" className="h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{i.title}</p>
                  <p className="label-caps text-muted-foreground">
                    {i.brand} · {i.size}
                  </p>
                </div>
                <span className="text-sm">{formatPKR(i.price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="label-caps text-muted-foreground">Total</span>
            <span className="font-display text-2xl font-black">{formatPKR(total)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="label-caps mt-5 inline-flex w-full items-center justify-center gap-2 bg-foreground px-6 py-4 text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Placing order…" : "Place order"}
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Every pair is one of one. Once we verify your payment the pair is marked sold and taken
            off the store.
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-caps text-muted-foreground">{label}</span>
      <span className="mt-1 block">{children}</span>
    </label>
  );
}
