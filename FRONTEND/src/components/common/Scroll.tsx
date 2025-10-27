interface ScrollContainerProps {
  size?: "sm" | "md" | "lg";
  direction?: "vertical" | "horizontal";
  variant?: "default" | "lightBlue" | "vendor";
  children: React.ReactNode;
}

const sizeMap = {
  sm: "h-40 w-60",
  md: "h-64 w-96",
  lg: "h-96 w-[32rem]",
};

const directionMap = {
  vertical: "overflow-y-auto",
  horizontal: "overflow-x-auto flex",
};

const variantMap = {
  default: "bg-white border border-gray-300",
  lightBlue: "bg-lightBlue-50 border-lightBlue-300",
  vendor: "bg-vendor-50 border-vendor-300",
};

export default function ScrollContainer({
  size = "md",
  direction = "vertical",
  variant = "default",
  children,
}: ScrollContainerProps) {
  return (
    <div
      className={`rounded p-4 ${sizeMap[size]} ${directionMap[direction]} ${variantMap[variant]} 
                  scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-100`}
    >
      {children}
    </div>
  );
}

{/* <ScrollContainer size="lg" direction="vertical" variant="vendor"></ScrollContainer> */}
{/* <ScrollContainer size="md" direction="horizontal" variant="lightBlue">
 </ScrollContainer> */}
