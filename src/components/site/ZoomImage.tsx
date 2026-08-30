import { useRef, useState } from "react";

interface ProductImageZoomProps {
  src: string;
  alt: string;
  zoomFactor?: number; // Magnification factor (e.g., 2.5 = 250% zoom)
  lensSize?: number; // Diameter of the lens in pixels
}

export function ProductImageZoom({
  src,
  alt,
  zoomFactor = 2.5,
  lensSize = 160,
}: ProductImageZoomProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showLens, setShowLens] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });
  const [bgSize, setBgSize] = useState({ w: 0, h: 0 });

  function updatePosition(clientX: number, clientY: number) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    // Mouse coordinates relative to the top-left of the container
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;

    // Clamp mouse coordinates inside container edges
    const x = Math.min(Math.max(rawX, 0), rect.width);
    const y = Math.min(Math.max(rawY, 0), rect.height);

    // Keep the lens visual circle within the container bounds
    const clampedLensX = Math.min(
      Math.max(x, lensSize / 2),
      rect.width - lensSize / 2
    );
    const clampedLensY = Math.min(
      Math.max(y, lensSize / 2),
      rect.height - lensSize / 2
    );

    setLensPos({ x: clampedLensX, y: clampedLensY });

    // Set magnified size relative to the container element width/height
    setBgSize({
      w: rect.width * zoomFactor,
      h: rect.height * zoomFactor,
    });

    // Calculate background pixel position to align exact focal point under lens center
    const bgX = -(x * zoomFactor - lensSize / 2);
    const bgY = -(y * zoomFactor - lensSize / 2);

    setBgPos({ x: bgX, y: bgY });
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    setShowLens(true);
    updatePosition(e.clientX, e.clientY);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!showLens && e.pointerType === "mouse") {
      setShowLens(true);
    }
    if (showLens || e.pointerType === "mouse") {
      updatePosition(e.clientX, e.clientY);
    }
  }

  function handlePointerLeave() {
    setShowLens(false);
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-square w-full h-full overflow-hidden cursor-crosshair select-none touch-none bg-background border border-border rounded-lg"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerUp={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      {/* Base Display Image */}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-contain pointer-events-none"
        draggable={false}
      />

      {/* Magnifier Lens */}
      {showLens && (
        <div
          className="pointer-events-none absolute rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.15),0_10px_25px_-5px_rgba(0,0,0,0.3)] z-10"
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${lensPos.x - lensSize / 2}px`,
            top: `${lensPos.y - lensSize / 2}px`,
            backgroundImage: `url("${src}")`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${bgSize.w}px ${bgSize.h}px`,
            backgroundPosition: `${bgPos.x}px ${bgPos.y}px`,
          }}
        />
      )}
    </div>
  );
}
