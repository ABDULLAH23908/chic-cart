import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { paymentLabel, type Order, type OrderItem, type OrderStatus } from "@/lib/orders";
import { formatPKR } from "@/lib/shop";

type OrderWithItems = Order & { items: OrderItem[] };

export function AdminOrders() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"pending" | "verified" | "rejected" | "all">("pending");
  const [receipt, setReceipt] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async (): Promise<OrderWithItems[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const { data: items, error: itemsError } = await supabase.from("order_items").select("*");
      if (itemsError) throw itemsError;
      return (data as Order[]).map((o) => ({
        ...o,
        items: ((items ?? []) as OrderItem[]).filter((i) => i.order_id === o.id),
      }));
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ order, status }: { order: OrderWithItems; status: OrderStatus }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
      if (error) throw error;

      if (status === "verified") {
        const ids = order.items.map((i) => i.product_id).filter((id): id is string => !!id);
        if (ids.length > 0) {
          const { error: soldError } = await supabase
            .from("products")
            .update({ in_stock: false })
            .in("id", ids);
          if (soldError) throw soldError;
        }
      }
    },
    onSuccess: (_d, vars) => {
      toast.success(
        vars.status === "verified"
          ? "Payment verified — the pairs are now marked sold"
          : "Order rejected",
      );
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not update order"),
  });

  const removeOrder = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orders").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order deleted");
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not delete order"),
  });

  const counts = {
    pending: orders?.filter((o) => o.status === "pending").length ?? 0,
    verified: orders?.filter((o) => o.status === "verified").length ?? 0,
    rejected: orders?.filter((o) => o.status === "rejected").length ?? 0,
  };
  const visible = (orders ?? []).filter((o) => (tab === "all" ? true : o.status === tab));

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black uppercase">Orders {orders ? `(${orders.length})` : ""}</h2>
        <div className="flex flex-wrap gap-2">
          {(["pending", "verified", "rejected", "all"] as const).map((t) => (
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
              {t === "all" ? "All" : `${t} (${counts[t]})`}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Verifying an order marks every pair in it as sold, so it drops out of trending, best
        sellers, new arrivals and the shop grid (and disappears completely 24 hours later).
      </p>

      {isLoading && <p className="mt-6 text-sm text-muted-foreground">Loading orders…</p>}
      {!isLoading && visible.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No orders here yet.</p>
      )}

      <ul className="mt-5 space-y-4">
        {visible.map((o) => (
          <li key={o.id} className="border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold">
                  {o.customer_name} · {o.phone}
                </p>
                <p className="label-caps text-muted-foreground">
                  #{o.id.slice(0, 8).toUpperCase()} · {new Date(o.created_at).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {o.address}
                  {o.city ? `, ${o.city}` : ""}
                </p>
                {o.email && <p className="text-xs text-muted-foreground">{o.email}</p>}
                {o.notes && <p className="mt-1 text-xs text-muted-foreground">Note: {o.notes}</p>}
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-black">{formatPKR(o.total)}</p>
                <p className="label-caps text-muted-foreground">{paymentLabel(o.payment_method)}</p>
                <span
                  className={
                    "label-caps mt-1 inline-block px-2 py-1 " +
                    (o.status === "verified"
                      ? "bg-foreground text-background"
                      : o.status === "rejected"
                        ? "border border-destructive text-destructive"
                        : "border border-border text-muted-foreground")
                  }
                >
                  {o.status}
                </span>
              </div>
            </div>

            <ul className="mt-4 divide-y divide-border border-y border-border">
              {o.items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                  <span className="min-w-0 truncate">
                    {i.title}{" "}
                    <span className="label-caps text-muted-foreground">
                      {i.brand} {i.size && `· ${i.size}`}
                    </span>
                  </span>
                  <span>{formatPKR(i.price)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {o.payment_reference && (
                <p className="label-caps text-muted-foreground">Ref: {o.payment_reference}</p>
              )}
              {o.receipt_image ? (
                <button
                  onClick={() => setReceipt(o.receipt_image)}
                  className="label-caps border border-border px-3 py-2 hover:border-foreground"
                >
                  View receipt
                </button>
              ) : (
                <span className="label-caps text-muted-foreground">
                  {o.payment_method === "cod" ? "Cash on delivery" : "No receipt attached"}
                </span>
              )}
              <div className="ml-auto flex flex-wrap gap-2">
                {o.status !== "verified" && (
                  <button
                    disabled={setStatus.isPending}
                    onClick={() => setStatus.mutate({ order: o, status: "verified" })}
                    className="label-caps inline-flex items-center gap-2 bg-foreground px-4 py-2 text-background disabled:opacity-50"
                  >
                    {setStatus.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="h-3.5 w-3.5" />
                    )}
                    Verify payment
                  </button>
                )}
                {o.status !== "rejected" && (
                  <button
                    onClick={() => setStatus.mutate({ order: o, status: "rejected" })}
                    className="label-caps inline-flex items-center gap-2 border border-border px-4 py-2 hover:border-foreground"
                  >
                    <X className="h-3.5 w-3.5" /> Reject
                  </button>
                )}
                <button
                  onClick={() => removeOrder.mutate(o.id)}
                  className="label-caps inline-flex items-center gap-2 border border-border px-3 py-2 text-destructive"
                  aria-label="Delete order"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {receipt && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-background/90 p-6"
          onClick={() => setReceipt(null)}
        >
          <img
            src={receipt}
            alt="Payment receipt"
            className="max-h-[85vh] max-w-full border border-border object-contain"
          />
        </div>
      )}
    </section>
  );
}
