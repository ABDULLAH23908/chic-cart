import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/lib/cart";
import hblQr from "@/assets/hbl-qr.png.asset.json";

export type PaymentMethodId = "cod" | "jazzcash" | "easypaisa" | "bank";

export type PaymentMethod = {
  id: PaymentMethodId;
  label: string;
  blurb: string;
  /** Account details shown to the customer for manual transfers. */
  account?: { title: string; number: string; holder: string; iban?: string; branch?: string };
  /** Scannable QR image for bank transfers. */
  qr?: string;
  requiresReceipt: boolean;
};

const WALLET_NUMBER = "+92 335 5116194";
const ACCOUNT_HOLDER = "Najam Shehzad";

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cod",
    label: "Cash on delivery",
    blurb: "Pay the courier in cash when your pair arrives. No receipt needed.",
    requiresReceipt: false,
  },
  {
    id: "bank",
    label: "Bank transfer (HBL)",
    blurb: "Scan the HBL QR code or transfer using the account details below, then attach the receipt below.",
    account: {
      title: "HBL Bank",
      number: "10677901106403",
      holder: ACCOUNT_HOLDER,
      iban: "PK22HABB0010677901106403",
      branch: "SOHAWA",
    },
    qr: hblQr.url,
    requiresReceipt: true,
  },
  {
    id: "jazzcash",
    label: "JazzCash",
    blurb: "Send the total to our JazzCash account, then attach the receipt below.",
    account: { title: "JazzCash", number: WALLET_NUMBER, holder: ACCOUNT_HOLDER },
    requiresReceipt: true,
  },
  {
    id: "easypaisa",
    label: "Easypaisa",
    blurb: "Send the total to our Easypaisa account, then attach the receipt below.",
    account: { title: "Easypaisa", number: WALLET_NUMBER, holder: ACCOUNT_HOLDER },
    requiresReceipt: true,
  },
];


export type OrderStatus = "pending" | "verified" | "rejected";

export type Order = {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  payment_method: PaymentMethodId;
  payment_reference: string;
  receipt_image: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  title: string;
  brand: string;
  size: string;
  price: number;
};

export type PlaceOrderInput = {
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  payment_method: PaymentMethodId;
  payment_reference: string;
  receipt_image: string | null;
  items: CartItem[];
};

export type OrderWithItems = Order & { order_items: OrderItem[] };

export function paymentLabel(id: string) {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id;
}

/** All orders with their line items, newest first — for the admin panel. */
export async function fetchOrders(): Promise<OrderWithItems[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as OrderWithItems[];
}

/**
 * Confirms an order's payment: flips its status to "verified" and marks every
 * product in the order sold (in_stock = false) so it drops off the storefront.
 */
export async function verifyOrder(order: OrderWithItems): Promise<void> {
  const { error } = await supabase.from("orders").update({ status: "verified" }).eq("id", order.id);
  if (error) throw error;

  const productIds = order.order_items.map((i) => i.product_id).filter((id): id is string => !!id);
  if (productIds.length === 0) return;

  const { error: stockError } = await supabase
    .from("products")
    .update({ in_stock: false })
    .in("id", productIds);
  if (stockError) throw stockError;
}

export async function rejectOrder(id: string): Promise<void> {
  const { error } = await supabase.from("orders").update({ status: "rejected" }).eq("id", id);
  if (error) throw error;
}

export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) throw error;
}

export async function placeOrder(input: PlaceOrderInput): Promise<string> {
  const total = input.items.reduce((n, i) => n + i.price, 0);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customer_name,
      phone: input.phone,
      email: input.email,
      address: input.address,
      city: input.city,
      notes: input.notes,
      payment_method: input.payment_method,
      payment_reference: input.payment_reference,
      receipt_image: input.receipt_image,
      total,
      status: "pending",
    })
    .select("id")
    .single();
  if (error || !order) throw error ?? new Error("Could not place the order");

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((i) => ({
      order_id: order.id,
      product_id: i.id,
      title: i.title,
      brand: i.brand,
      size: i.size,
      price: i.price,
    })),
  );
  if (itemsError) throw itemsError;

  return order.id;
}

/** Reads a receipt image into a compressed data URL that fits the backend limit. */
export function readReceiptFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.onload = () => {
      const src = String(reader.result);
      const img = new Image();
      img.onerror = () => resolve(src);
      img.onload = () => {
        const max = 1400;
        const scale = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(src);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
