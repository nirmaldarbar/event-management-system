import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Pagination({ page, totalPages, onPageChange }) {
  const items = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 2 && p <= page + 2)) items.push(p);
    else if (p === page - 3 || p === page + 3) items.push(`gap-${p}`);
  }

  return (
    <nav className="flex flex-wrap items-center justify-center gap-1.5" aria-label="Pagination">
      <Button variant="outline" size="icon-sm" onClick={() => onPageChange(1)} disabled={page === 1} aria-label="First page">
        <ChevronsLeft />
      </Button>
      <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous page">
        <ChevronLeft />
      </Button>
      {items.map((item) =>
        typeof item === "string" ? (
          <span key={item} className="px-1 text-muted-foreground">…</span>
        ) : (
          <Button
            key={item}
            size="icon-sm"
            variant={item === page ? "default" : "ghost"}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </Button>
        )
      )}
      <Button variant="outline" size="icon-sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next page">
        <ChevronRight />
      </Button>
      <Button variant="outline" size="icon-sm" onClick={() => onPageChange(totalPages)} disabled={page === totalPages} aria-label="Last page">
        <ChevronsRight />
      </Button>
    </nav>
  );
}
