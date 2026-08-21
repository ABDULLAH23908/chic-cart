import { useRef, useState } from "react";

/**
 * Magnifying-glass image viewer.
 * Works with mouse (hover) and touch (drag) via pointer events.
 */
export function ZoomImage({
  src,
  alt,
  zoom = 2.6,
}: {
  src: string;
  alt: string;
  zoom?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ lx: 0, ly: 0 });

  const move = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const lx = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const ly = Math.min(Math.max(clientY - rect.top, 0), rect.height);
    setPos({ lx, ly });
  };

  const lensSize = 150;

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
      <img src={src} alt={alt} className="h-full w-full object-cover" draggable={false} />

      {active && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-foreground shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
          style={{
            width: lensSize,
            height: lensSize,
            left: pos.lx - lensSize / 2,
            top: pos.ly - lensSize / 2,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${zoom * 100}% ${zoom * 100}%`,
            // Center the zoomed image point under the cursor
            backgroundPosition: `-${pos.lx * zoom - lensSize / 2}px -${pos.ly * zoom - lensSize / 2}px`,
          }}
        />
      )}

      <span className="label-caps pointer-events-none absolute bottom-3 left-3 bg-foreground/85 px-2 py-1 text-background">
        {active ? "Zooming" : "Hover / hold to zoom"}
      </span>
    </div>
  );
}
