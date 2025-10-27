import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../atoms/Button";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void; // optional to keep backward compatibility
  pageSizeOptions?: number[]; // optional list of sizes
}

export default function PaginationBar({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5,10,15,20,25, 30,50, 100],
}: PaginationBarProps) {
  
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const goto = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  // Build pages with ellipses when > 6 pages
  const buildPages = () => {
    if (totalPages <= 6) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "...")[] = [];
    const showLeft = currentPage > 3;
    const showRight = currentPage < totalPages - 2;

    pages.push(1);
    if (showLeft) pages.push("...");

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let p = start; p <= end; p++) pages.push(p);

    if (showRight) pages.push("...");
    pages.push(totalPages);
    return pages;
  };

  const pages = buildPages();

  return (
    <div className="flex items-center justify-between text-sm px-4 py-2 border-t-1 w-full rounded-b-0  border-neutral-200 gap-3">
      {/* Left: Range Info */}
      <div className="flex gap-2 items-center">
        {/* Center: Rows per page */}
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-neutral-500">Pages</span>
          <select
            className="border border-neutral-300 rounded px-2 py-1 bg-white text-sm cursor-pointer"
            value={pageSize}
            onChange={(e) => {
              const size = parseInt(e.target.value, 10);
              onPageSizeChange?.(size);
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <p className="text-gray-700 text-sm whitespace-nowrap">
          Showing <span className="font-bold text-primary-500">{startItem}</span> –
          <span className="font-bold text-primary-500"> {endItem}</span> of
          <span className="font-bold text-primary-500"> {totalItems}</span> entries
        </p>
      </div>

      {/* Right: Pagination Controls */}
      <div className="flex items-center gap-1">
        {/* <button
          type="button"
          onClick={() => goto(currentPage - 1)}
          disabled={!canPrev}
          className="px-2 py-1 rounded disabled:opacity-50 hover:bg-neutral-100"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </button> */}
        <Button variant="muted" size="sm" 
          disabled={!canPrev}
           aria-label="Previous page"
           className={`bg-white h-6 w-6  p-0 over:bg-neutral-100 ${
            !canPrev
              ? "cursor-pointer"
              : "hover:bg-neutral-100 text-neutral-800 border-0"
          }`}
            onClick={() => goto(currentPage - 1)}>
               <ChevronLeft className="size-4" />
        </Button>

        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-neutral-500">
              …
            </span>
          ) : (
            // <button
            //   key={p}
            //   type="button"
            //   onClick={() => goto(p as number)}
            //   className={`rounded text-sm h-6 w-6 ${
            //     p === currentPage
            //       ? "bg-primary-600 text-black bg-primary-600 font-semibold"
            //       : "hover:bg-neutral-100 text-neutral-800"
            //   }`}
            //   aria-current={p === currentPage ? "page" : undefined}
            // >
            //   {p}
            // </button>
            <Button variant="muted" size="sm" key={p} 
              className={`rounded text-sm h-6 w-6  p-0 border-0 ${
              p === currentPage
                ? "text-black font-semibold bg-blue-600 text-white hover:text-black "
                : "hover:bg-neutral-100 text-neutral-800"
            }`} onClick={() => goto(p as number)} aria-current={p === currentPage ? "page" : undefined}>
              
              {p}
            </Button>
          )
        )}

        {/* <button
          type="button"
          onClick={() => goto(currentPage + 1)}
          disabled={!canNext}
          className="px-2 py-1 rounded disabled:opacity-50 hover:bg-neutral-100"
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </button> */}
        <Button variant="muted" size="sm" 
            disabled={!canNext}
            aria-label="Next page"
            className={`bg-white h-6 w-6  p-0 over:bg-neutral-100 ${
              !canNext
                ? "cursor-pointer"
                : "hover:bg-neutral-100 text-neutral-800 border-0"
            }`}
            onClick={() => goto(currentPage + 1)}>
              <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
