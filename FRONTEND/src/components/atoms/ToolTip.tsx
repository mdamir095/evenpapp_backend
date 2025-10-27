// Tooltip.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";

export default function Tooltip({
  children,
  label,
  disabled = false,
}: { children: React.ReactNode; label: string; disabled?: boolean }) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);

  if (disabled) return <>{children}</>;

  return (
    <div
      className="block w-full"  // <- full width so hover area = whole row
      onMouseEnter={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setCoords({ x: r.right + 8, y: r.top + r.height / 2 });
      }}
      onMouseLeave={() => setCoords(null)}
    >
      {children}
      {coords &&
        createPortal(
          <div
            className="fixed z-[9999] bg-gray-900 text-white text-xs px-2 py-1 rounded shadow pointer-events-none"
            style={{ top: coords.y, left: coords.x, transform: "translateY(-50%)", whiteSpace: "nowrap" }}
          >
            {label}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-full border-4 border-transparent border-r-gray-900" />
          </div>,
          document.body
        )}
    </div>
  );
}
