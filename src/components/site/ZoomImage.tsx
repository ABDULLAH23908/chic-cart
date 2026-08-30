import { useRef, useState } from "react";

interface ZoomImageProps {
  src: string;
  alt: string;
  zoom?: number;
  lensSize?: number; // Size of the circular lens in pixels
}

export function ZoomImage({
  src,
  alt,
  zoom = 2.4,
  lensSize = 160,
}: ZoomImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 }); // Mouse position relative to container (px)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const move = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    
    // Calculate position in pixels within the container
    const xPx = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const yPx = Math.min(Math.max(clientY - rect.top, 0), rect.height);

    setPos({ x: xPx, y: yPx });
    setContainerSize({ width: rect.width, height: rect.height });
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full touch-none overflow-hidden border border-border bg-secondary select-none cursor-crosshair"
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
      {/* Base Image */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="h-full w-full object-cover"
      />

      {/* Circular Magnifier Lens */}
      {active && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-primary shadow-2xl overflow-hidden"
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${pos.x - lensSize / 2}px`,
            top: `${pos.y - lensSize / 2}px`,
            backgroundImage: `url("${src}")`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${containerSize.width * zoom}px ${containerSize.height * zoom}px`,
            backgroundPosition: `${lensSize / 2 - pos.x * zoom}px ${lensSize / 2 - pos.y * zoom}px`,
          }}
        />
      )}

      {/* Label Badge */}
      <span className="label-caps pointer-events-none absolute bottom-3 left-3 bg-foreground/85 px-2 py-1 text-background">
        {active ? "Zooming" : "Hover / hold to zoom"}
      </span>
    </div>
  );
}
