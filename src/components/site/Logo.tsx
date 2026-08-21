import { STORE_NAME, STORE_SHORT_NAME } from "@/lib/shop";

/**
 * MTS logo mark. Designed to sit on the dark header/footer background
 * (bg-foreground), so the mark itself is inverted: light block, dark text.
 */
export function Logo({
  showWordmark = true,
  className = "",
}: {
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-2.5 ${className}`}>
      <span
        className="font-display grid h-9 w-9 shrink-0 place-items-center bg-background text-[13px] leading-none font-black tracking-tight text-foreground"
        aria-hidden="true"
      >
        {STORE_SHORT_NAME}
      </span>
      {showWordmark && (
        <span className="font-display hidden text-sm font-black tracking-[0.18em] uppercase sm:inline">
          {STORE_NAME}
        </span>
      )}
    </span>
  );
}
