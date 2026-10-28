"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function Pagination({ page, pageSize, totalCount, onPageChange, className }) {
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / (pageSize || 1)));
  if (totalPages <= 1) {
    return totalCount ? (
      <p className={className ?? "mt-4 text-sm text-muted"}>{totalCount} result{totalCount === 1 ? "" : "s"}</p>
    ) : null;
  }
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  return (
    <nav aria-label="Pagination" className={className ?? "mt-4 flex flex-wrap items-center justify-between gap-3"}>
      <p className="text-sm text-muted">
        {from}–{to} of {totalCount}
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1} aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" /> Prev
        </Button>
        <span className="min-w-20 text-center text-sm text-ink" aria-current="page">
          Page {page} / {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} aria-label="Next page">
          Next <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </nav>
  );
}
