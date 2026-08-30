import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import { Loader2, Trash2, Upload, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import {
  deleteOrder,
  fetchOrders,
  paymentLabel,
  rejectOrder,
  verifyOrder,
  type OrderStatus,
} from "@/lib/orders";
import { CATEGORIES, formatPKR, isHiddenSold, soldHoursLeft, type Product } from "@/lib/shop";

const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 5; // 5 years

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Prime Shoes" },
      {
        name: "description",
        content: "Add new shoes with sizes, pricing and multiple photos.",
      },
      { property: "og:title", content: "Admin Panel — Prime Shoes" },
      { property: "og:description", content: "Manage the Prime Shoes inventory." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", session?.user.id],
    enabled: !!session,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("role", "admin")
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });

  if (!ready) {
    return <div className="px-4 py-24 text-center text-sm text-muted-foreground">Loading…</div>;
  }

  if (!session) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-3xl font-black uppercase">Admin panel</h1>
        <p className="mt-3 text-sm text-muted-foreground">Sign in to manage the inventory.</p>
        <Link
          to="/auth"
          className="label-caps mt-6 inline-block bg-foreground px-6 py-3 text-background"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="text-3xl font-black uppercase">No admin access</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Signed in as {session.user.email}. Ask the store owner to grant this account admin access.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="label-caps mt-6 border border-border px-6 py-3"
        >
          Sign out
        </button>
      </div>
    );
  }

  return <AdminDashboard email={session.user.email ?? ""} />;
}

type FormState = {
  title: string;
  brand: string;
  category: string;
  size: string;
  price: string;
  original_price: string;
  description: string;
  in_stock: boolean;
  featured: boolean;
  trending: boolean;
  best_seller: boolean;
  new_arrival: boolean;
};

const EMPTY: FormState = {
  title: "",
  brand: "",
  category: "men",
  size: "",
  price: "",
  original_price: "",
  description: "",
  in_stock: true,
  featured: false,
  trending: false,
  best_seller: false,
  new_arrival: false,
};

function AdminDashboard({ email }: { email: string }) {
  const [section, setSection] = useState<"orders" | "products">("orders");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-3xl font-black uppercase sm:text-4xl">Admin panel</h1>
          <p className="label-caps text-muted-foreground">{email}</p>
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="label-caps shrink-0 border border-border px-4 py-3"
        >
          Sign out
        </button>
      </header>

      <div className="mt-8 flex gap-px bg-border">
        {(["orders", "products"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={
              "label-caps flex-1 py-3 text-center sm:flex-none sm:px-8 " +
              (section === s ? "bg-foreground text-background" : "bg-card hover:bg-secondary")
            }
          >
            {s === "orders" ? "Orders" : "Products"}
          </button>
        ))}
      </div>

      <div className="mt-10">{section === "orders" ? <OrdersSection /> : <ProductsSection />}</div>
    </div>
  );
}

const ORDER_STATUS_TABS = ["pending", "verified", "rejected"] as const;

function OrdersSection() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"all" | OrderStatus>("pending");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: fetchOrders,
  });

  const counts = {
    pending: orders?.filter((o) => o.status === "pending").length ?? 0,
    verified: orders?.filter((o) => o.status === "verified").length ?? 0,
    rejected: orders?.filter((o) => o.status === "rejected").length ?? 0,
  };
  const visible = (orders ?? []).filter((o) => (tab === "all" ? true : o.status === tab));

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin-orders"] });
    qc.invalidateQueries({ queryKey: ["admin-products"] });
    qc.invalidateQueries({ queryKey: ["products"] });
  };

  const verify = useMutation({
    mutationFn: verifyOrder,
    onSuccess: () => {
      toast.success("Order verified — items marked sold");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not verify order"),
  });

  const reject = useMutation({
    mutationFn: rejectOrder,
    onSuccess: () => {
      toast.success("Order rejected");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not reject order"),
  });

  const remove = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      toast.success("Order deleted");
      invalidate();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not delete order"),
  });

  if (isLoading) {
    return <p className="py-12 text-center text-sm text-muted-foreground">Loading orders…</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black uppercase">
          Orders {orders ? `(${orders.length})` : ""}
        </h2>
        <div className="flex flex-wrap gap-2">
          {(["all", ...ORDER_STATUS_TABS] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={
                "label-caps border px-3 py-2 " +
                (tab === t
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground")
              }
            >
              {t === "all"
                ? "All"
                : t === "pending"
                  ? `Pending (${counts.pending})`
                  : t === "verified"
                    ? `Verified (${counts.verified})`
                    : `Rejected (${counts.rejected})`}
            </button>
          ))}
        </div>
      </div>

      <ul className="mt-5 divide-y divide-border border-y border-border">
        {visible.map((o) => {
          const isOpen = expanded === o.id;
          const total = o.order_items.reduce((n, i) => n + i.price, 0) || o.total;
          return (
            <li key={o.id} className="py-4">
              <button
                type="button"
                onClick={() => setExpanded(isOpen ? null : o.id)}
                className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 text-left"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-bold">{o.customer_name}</p>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="label-caps mt-0.5 text-muted-foreground">
                    {o.phone} · {o.order_items.length}{" "}
                    {o.order_items.length === 1 ? "item" : "items"} ·{" "}
                    {paymentLabel(o.payment_method)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-display text-lg font-black">{formatPKR(total)}</p>
                  <p className="label-caps text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString()}
                  </p>
                </div>
              </button>

              {isOpen && (
                <div className="mt-4 grid gap-6 border border-border p-5 sm:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <p className="label-caps text-muted-foreground">Customer</p>
                      <p className="text-sm font-bold">{o.customer_name}</p>
                      <p className="text-sm">{o.phone}</p>
                      {o.email && <p className="text-sm">{o.email}</p>}
                    </div>
                    <div>
                      <p className="label-caps text-muted-foreground">Delivery address</p>
                      <p className="text-sm">
                        {o.address}
                        {o.city ? `, ${o.city}` : ""}
                      </p>
                    </div>
                    {o.notes && (
                      <div>
                        <p className="label-caps text-muted-foreground">Order notes</p>
                        <p className="text-sm">{o.notes}</p>
                      </div>
                    )}
                    <div>
                      <p className="label-caps text-muted-foreground">Payment</p>
                      <p className="text-sm">{paymentLabel(o.payment_method)}</p>
                      {o.payment_reference && (
                        <p className="text-sm text-muted-foreground">Ref: {o.payment_reference}</p>
                      )}
                    </div>
                    {o.receipt_image && (
                      <div>
                        <p className="label-caps text-muted-foreground">Payment receipt</p>
                        <a href={o.receipt_image} target="_blank" rel="noreferrer">
                          <img
                            src={o.receipt_image}
                            alt="Payment receipt"
                            className="mt-1 max-h-48 border border-border"
                          />
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="label-caps text-muted-foreground">Items</p>
                    <ul className="mt-2 divide-y divide-border border-y border-border">
                      {o.order_items.map((i) => (
                        <li key={i.id} className="flex items-center justify-between gap-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-bold">{i.title}</p>
                            <p className="label-caps text-muted-foreground">
                              {i.brand} · {i.size}
                            </p>
                          </div>
                          <span className="shrink-0 text-sm">{formatPKR(i.price)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="label-caps text-muted-foreground">Total</span>
                      <span className="font-display text-xl font-black">{formatPKR(total)}</span>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {o.status === "pending" && (
                        <>
                          <button
                            onClick={() => verify.mutate(o)}
                            disabled={verify.isPending}
                            className="label-caps inline-flex items-center gap-2 bg-foreground px-4 py-3 text-background disabled:opacity-50"
                          >
                            {verify.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            Verify order
                          </button>
                          <button
                            onClick={() => reject.mutate(o.id)}
                            disabled={reject.isPending}
                            className="label-caps border border-destructive px-4 py-3 text-destructive disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {o.status === "rejected" && (
                        <button
                          onClick={() => verify.mutate(o)}
                          disabled={verify.isPending}
                          className="label-caps border border-foreground px-4 py-3 disabled:opacity-50"
                        >
                          Verify anyway
                        </button>
                      )}
                      <button
                        onClick={() => remove.mutate(o.id)}
                        disabled={remove.isPending}
                        className="label-caps ml-auto grid h-11 w-11 place-items-center border border-border text-destructive disabled:opacity-50"
                        aria-label="Delete order"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {visible.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {orders?.length ? "Nothing in this tab." : "No orders yet."}
        </p>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    pending: "border-amber-500 text-amber-600",
    verified: "border-emerald-600 text-emerald-700",
    rejected: "border-destructive text-destructive",
  };
  return (
    <span className={"label-caps shrink-0 border px-2 py-0.5 text-[10px] " + styles[status]}>
      {status}
    </span>
  );
}

function ProductsSection() {
  const qc = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [tab, setTab] = useState<"all" | "in-stock" | "sold">("all");

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Product[]).sort(
        (a, b) => Number(a.in_stock === false) - Number(b.in_stock === false),
      );
    },
  });

  const counts = {
    inStock: products?.filter((p) => p.in_stock).length ?? 0,
    sold: products?.filter((p) => !p.in_stock).length ?? 0,
  };
  const visible = (products ?? []).filter((p) =>
    tab === "all" ? true : tab === "in-stock" ? p.in_stock : !p.in_stock,
  );

  const pickFiles = (list: FileList | null) => {
    if (!list) return;
    const next = Array.from(list);
    setFiles((prev) => [...prev, ...next]);
    setPreviews((prev) => [...prev, ...next.map((f) => URL.createObjectURL(f))]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const create = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Add a product name");
      if (!form.price.trim()) throw new Error("Add a price");

      const urls: string[] = [];
      for (const file of files) {
        const ext = file.name.split(".").pop() ?? "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("product-images")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        const { data: signed, error: signErr } = await supabase.storage
          .from("product-images")
          .createSignedUrl(path, SIGNED_URL_TTL);
        if (signErr) throw signErr;
        urls.push(signed.signedUrl);
      }

      const { error } = await supabase.from("products").insert({
        title: form.title.trim(),
        brand: form.brand.trim(),
        category: form.category,
        size: form.size.trim(),
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        description: form.description.trim(),
        images: urls,
        in_stock: form.in_stock,
        featured: form.featured,
        trending: form.trending,
        best_seller: form.best_seller,
        new_arrival: form.new_arrival,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product published");
      setForm(EMPTY);
      setFiles([]);
      setPreviews([]);
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save product"),
  });

  const removeProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Product removed");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not delete"),
  });

  const toggleStock = useMutation({
    mutationFn: async ({ id, in_stock }: { id: string; in_stock: boolean }) => {
      const { error } = await supabase.from("products").update({ in_stock }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const setFlag = useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<Product, "featured" | "trending" | "best_seller" | "new_arrival">>;
    }) => {
      const { error } = await supabase.from("products").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not update"),
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[420px_minmax(0,1fr)]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate();
        }}
        className="space-y-4 border border-border p-6"
      >
        <h2 className="text-xl font-black uppercase">Add a new pair</h2>

        <Field label="Product name *">
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Air Force 1 LV8 'Midnight Navy'"
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Brand">
            <input
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="Nike"
              className={inputClass}
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Size">
            <input
              value={form.size}
              onChange={(e) => setForm({ ...form, size: e.target.value })}
              placeholder="8.5 UK / 43 EUR"
              className={inputClass}
            />
          </Field>
          <Field label="Price (PKR) *">
            <input
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="1999"
              className={inputClass}
            />
          </Field>
          <Field label="Original price">
            <input
              type="number"
              min={0}
              value={form.original_price}
              onChange={(e) => setForm({ ...form, original_price: e.target.value })}
              placeholder="4000"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Details / flaws">
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            placeholder="Minor sole scuff, clean upper, laces replaced…"
            className={inputClass}
          />
        </Field>

        <Field label="Photos (multiple)">
          <label className="label-caps flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border py-6 text-muted-foreground hover:border-foreground">
            <Upload className="h-4 w-4" /> Choose photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => pickFiles(e.target.files)}
            />
          </label>
        </Field>

        {previews.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {previews.map((src, i) => (
              <div key={src} className="relative h-20 w-20 border border-border">
                <img src={src} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -top-2 -right-2 grid h-6 w-6 place-items-center bg-foreground text-background"
                  aria-label="Remove photo"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-5 pt-2">
          <label className="label-caps flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.in_stock}
              onChange={(e) => setForm({ ...form, in_stock: e.target.checked })}
            />
            In stock
          </label>
          <label className="label-caps flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            />
            Feature on home
          </label>
          <label className="label-caps flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.trending}
              onChange={(e) => setForm({ ...form, trending: e.target.checked })}
            />
            Trending now
          </label>
          <label className="label-caps flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.best_seller}
              onChange={(e) => setForm({ ...form, best_seller: e.target.checked })}
            />
            Best sellers
          </label>
          <label className="label-caps flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.new_arrival}
              onChange={(e) => setForm({ ...form, new_arrival: e.target.checked })}
            />
            New arrivals
          </label>
        </div>

        <button
          type="submit"
          disabled={create.isPending}
          className="label-caps inline-flex w-full items-center justify-center gap-2 bg-foreground px-6 py-4 text-background disabled:opacity-50"
        >
          {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {create.isPending ? "Publishing…" : "Publish product"}
        </button>
      </form>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-black uppercase">
            All products {products ? `(${products.length})` : ""}
          </h2>
          <div className="flex flex-wrap gap-2">
            {(["all", "in-stock", "sold"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={
                  "label-caps border px-3 py-2 " +
                  (tab === t
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground")
                }
              >
                {t === "all"
                  ? "All"
                  : t === "in-stock"
                    ? `In stock (${counts.inStock})`
                    : `Sold (${counts.sold})`}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Marking a pair sold moves it to the end of the store listings and hides it from the store
          automatically 24 hours later.
        </p>
        <ul className="mt-5 divide-y divide-border border-y border-border">
          {visible.map((p) => (
            <li
              key={p.id}
              className={
                "grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 py-3 " +
                (p.in_stock ? "" : "opacity-70")
              }
            >
              <div className="relative h-16 w-16 shrink-0 bg-secondary">
                {p.images[0] && (
                  <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                )}
                {!p.in_stock && (
                  <span className="absolute inset-x-0 bottom-0 bg-foreground py-0.5 text-center text-[9px] font-bold tracking-widest text-background">
                    SOLD
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <Link
                  to="/product/$id"
                  params={{ id: p.id }}
                  className="block truncate text-sm font-bold hover:underline"
                >
                  {p.title}
                </Link>
                <p className="label-caps text-muted-foreground">
                  {p.category} · {p.size || "no size"}
                </p>
                <p className="text-sm">{formatPKR(p.price)}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                  {SECTION_FLAGS.map(({ key, label }) => (
                    <label key={key} className="label-caps flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={!!p[key]}
                        onChange={(e) =>
                          setFlag.mutate({ id: p.id, patch: { [key]: e.target.checked } })
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {!p.in_stock && (
                  <p className="label-caps text-muted-foreground">
                    {isHiddenSold(p)
                      ? "Hidden from store"
                      : `Hides from store in ${soldHoursLeft(p.sold_at)}h`}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => toggleStock.mutate({ id: p.id, in_stock: !p.in_stock })}
                  className={
                    "label-caps border px-3 py-2 " +
                    (p.in_stock
                      ? "border-border"
                      : "border-foreground bg-foreground text-background")
                  }
                >
                  {p.in_stock ? "Mark sold" : "Restock"}
                </button>
                <button
                  onClick={() => removeProduct.mutate(p.id)}
                  className="grid h-9 w-9 place-items-center border border-border text-destructive"
                  aria-label="Delete product"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {visible.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {products?.length ? "Nothing in this tab." : "No products yet — add your first pair."}
          </p>
        )}
      </section>
    </div>
  );
}

const SECTION_FLAGS = [
  { key: "featured", label: "Featured" },
  { key: "trending", label: "Trending" },
  { key: "best_seller", label: "Best seller" },
  { key: "new_arrival", label: "New arrival" },
] as const;

const inputClass =
  "mt-2 w-full border border-border bg-card px-4 py-3 text-sm outline-none focus:border-foreground";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="label-caps text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
