interface TooltipProps {
  message: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  variant?: "dark" | "light";
  delay?: number; // in ms
  label: string; // ✅ This is missing
}

export default function Tooltip({
  message,
  children,
  position = "top",
  variant = "light",
  delay = 150,
}: TooltipProps) {
  const positionClasses = {
    top: "bottom-full mb-3 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-3 left-1/2 -translate-x-1/2",
    left: "right-full mr-3 top-1/2 -translate-y-1/2",
    right: "left-full ml-3 top-1/2 -translate-y-1/2",
  };

  const arrowClasses = {
    top: "bottom-[-6px] left-1/2 -translate-x-1/2 border-t-gray-800",
    bottom: "top-[-6px] left-1/2 -translate-x-1/2 border-b-gray-800",
    left: "right-[-6px] top-1/2 -translate-y-1/2 border-l-gray-800",
    right: "left-[-6px] top-1/2 -translate-y-1/2 border-r-gray-800",
  };

  const variantClasses = {
    dark: "bg-gray-800 text-white",
    light: "bg-white text-gray-800 border border-gray-300",
  };

  return (
    <div className="relative group inline-block">
      {children}
      <span
        className={`absolute z-10 px-2 py-1 text-xs rounded shadow-lg whitespace-nowrap
          opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100
          transition-all ease-out duration-300 delay-[${delay}ms]
          ${variantClasses[variant]} ${positionClasses[position]}`}
      >
        {message}
        <span
          className={`absolute w-0 h-0 border-8 border-transparent ${arrowClasses[position]}`}
        />
      </span>
    </div>
  );
}
// Usage example:
// <Tooltip message="This is a tooltip" position="top" variant="light">