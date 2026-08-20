import { STORE_NAME, whatsappLink } from "@/lib/shop";

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink("Hi! I'd like to order from " + STORE_NAME)}
      target="_blank"
      rel="noreferrer"
      aria-label="Order on WhatsApp"
      className="fixed right-5 bottom-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-whatsapp shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7 fill-white" aria-hidden="true">
        <path d="M16.04 4C9.96 4 5 8.94 5 15.02c0 2.12.6 4.1 1.64 5.79L5 28l7.36-1.6a11.1 11.1 0 0 0 3.68.63c6.08 0 11.04-4.94 11.04-11.02C27.08 8.94 22.12 4 16.04 4Zm6.46 15.55c-.27.76-1.57 1.46-2.18 1.51-.6.06-1.16.28-3.9-.87-3.3-1.4-5.36-4.82-5.52-5.05-.16-.23-1.3-1.86-1.3-3.54 0-1.68.9-2.5 1.22-2.84.32-.34.7-.42.94-.42.27 0 .54 0 .77.01.25.01.58-.09.9.68.32.78 1.06 2.6 1.15 2.79.09.19.15.41.02.65-.13.25-.26.4-.52.7-.26.3-.4.4-.58.7-.13.22-.06.44.06.65.13.21.7 1.2 1.53 1.95 1.06.95 1.9 1.28 2.14 1.41.24.13.45.11.62-.07.19-.2.72-.84.91-1.13.19-.29.39-.24.66-.14.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.75-.2 1.51Z" />
      </svg>
    </a>
  );
}
