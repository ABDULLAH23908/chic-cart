import markAsset from "@/assets/prime-mark.png.asset.json";
import { STORE_NAME } from "@/lib/shop";

/**
 * Prime triangle mark. Sits on the dark header/footer background
 * (bg-foreground), so the black mark is inverted to read white.
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
      <img
        src={markAsset.url}
        alt=""
        aria-hidden="true"
        className="h-8 w-10 shrink-0 object-contain invert"
      />
      {showWordmark && (
        <span className="font-display hidden text-sm font-black tracking-[0.28em] uppercase sm:inline">
          {STORE_NAME}
        </span>
      )}
    </span>
  );
}
