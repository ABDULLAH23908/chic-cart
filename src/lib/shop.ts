export const WHATSAPP_NUMBER = "923335129333";
export const WHATSAPP_DISPLAY = "+92 333 5129333";
export const STORE_NAME = "THRIFT LOCKER";

export const CATEGORIES = ["men", "women", "kids"] as const;
export const CONDITIONS = ["Premium+", "Premium", "Excellence", "Very Good"] as const;

export type Product = {
  id: string;
  title: string;
  brand: string;
  category: string;
  size: string;
  condition: string;
  price: number;
  original_price: number | null;
  description: string;
  images: string[];
  in_stock: boolean;
  featured: boolean;
  created_at: string;
};

export function formatPKR(value: number) {
  return "PKR " + new Intl.NumberFormat("en-PK").format(value);
}

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
