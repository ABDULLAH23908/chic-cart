import { useRef, useState } from "react";

/**
 * Product image zoom. Scales the same rendered <img> around the pointer
 * position via CSS transform, so the magnified view always matches exactly
 * what's on screen — no separate background-image math to get out of sync
 * with the image's actual crop.
 * Works with mouse (hover) and touch (press-and-drag) via pointer events.
 */
export function ZoomImage({ src, alt, zoom = 2.4 }: { src: string; alt: string; zoom?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const move = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (Math.min(Math.max(clientX - rect.left, 0), rect.width) / rect.width) * 100;
    const y = (Math.min(Math.max(clientY - rect.top, 0), rect.height) / rect.height) * 100;
    setOrigin({ x, y });
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full touch-none overflow-hidden border border-border bg-secondary select-none"
      onPointerDown={(e) => {
        setActive(true);
        move(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse" || active) move(e.clientX, e.clientY);
      }}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setActive(true);
      }}
      onPointerLeave={() => setActive(false)}
      onPointerUp={() => setActive(false)}
      onPointerCancel={() => setActive(false)}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="h-full w-full object-cover"
        style={{
          transform: active ? `scale(${zoom})` : "scale(1)",
          transformOrigin: `${origin.x}% ${origin.y}%`,
          transition: active ? "none" : "transform 150ms ease-out",
          willChange: "transform",
        }}
      />

      <span className="label-caps pointer-events-none absolute bottom-3 left-3 bg-foreground/85 px-2 py-1 text-background">
        {active ? "Zooming" : "Hover / hold to zoom"}
      </span>
    </div>
  );
}
