import bearAsset from "@/assets/rex-bear.png.asset.json";
import { STORE_NAME } from "@/lib/shop";

/**
 * REX bear mark. Sits on the dark header/footer background (bg-foreground),
 * so the black silhouette is inverted to read white.
 */
export function Logo({
  showWordmark = true,
  className = "",
}: {
  showWordmark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex shrink-0 items-start gap-2.5 ${className}`}>
      <img
        src={bearAsset.url}
        alt=""
        aria-hidden="true"
        className="h-9 w-11 shrink-0 translate-y-0.5 object-contain object-top invert"
      />
      {showWordmark && (
        <span className="font-display hidden text-sm leading-none font-black tracking-[0.18em] uppercase pt-0.5 sm:inline">
          {STORE_NAME}
        </span>
      )}
    </span>
  );
}
