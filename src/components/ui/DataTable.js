"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { cn } from "@/lib/utils/cn";

/**
 * Responsive data table (server-driven: the parent owns page / sort / search state and fetches).
 *  - ≥ md: a normal table inside a horizontally scrollable wrapper
 *  - < md: each row becomes a compact card, so nothing needs sideways scrolling on phones
 *
 * columns: [{ key, header, render?(row), sortable?, className?, primary?, hideOnMobile? }]
 */
export function DataTable({
  columns,
  rows,
  rowKey = "id",
  loading = false,
  error = null,
  onRetry,
  emptyTitle = "Nothing here yet",
  emptyBody,
  emptyAction,
  page = 1,
  pageSize = 20,
  totalCount = 0,
  onPageChange,
  sort,
  onSortChange,
  onRowClick,
  caption,
}) {
  if (error) {
    return (
      <ErrorState
        title="We could not load this list"
        body={error}
        action={
          onRetry ? (
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          ) : null
        }
      />
    );
  }

  if (!loading && (!rows || rows.length === 0)) {
    return <EmptyState title={emptyTitle} body={emptyBody} action={emptyAction} />;
  }

  const cell = (col, row) => (col.render ? col.render(row) : (row[col.key] ?? "—"));

  const toggleSort = (col) => {
    if (!col.sortable || !onSortChange) return;
    const dir = sort?.key === col.key && sort.dir === "asc" ? "desc" : "asc";
    onSortChange({ key: col.key, dir });
  };

  return (
    <div aria-busy={loading || undefined}>
      {/* Desktop / tablet */}
      <div className="hidden overflow-x-auto rounded-[var(--radius-card)] border border-line bg-white md:block">
        <table className="min-w-full divide-y divide-line text-sm">
          {caption ? <caption className="sr-only">{caption}</caption> : null}
          <thead className="bg-surface text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              {columns.map((col) => {
                const active = sort?.key === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
                    className={cn("px-4 py-3", col.className)}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(col)}
                        className="inline-flex items-center gap-1 uppercase hover:text-primary"
                      >
                        {col.header}
                        {active ? (
                          sort.dir === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <Skeleton className="h-4 w-full max-w-32" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.map((row) => (
                  <tr
                    key={row[rowKey]}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    className={cn(onRowClick && "cursor-pointer hover:bg-primary-50/60")}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className={cn("px-4 py-3 align-middle text-ink", col.className)}>
                        {cell(col, row)}
                      </td>
                    ))}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Phones */}
      <ul className="space-y-3 md:hidden">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <li key={i} className="rounded-[var(--radius-card)] border border-line bg-white p-4">
                <Skeleton className="mb-3 h-5 w-1/2" />
                <Skeleton className="h-4 w-full" />
              </li>
            ))
          : rows.map((row) => {
              const primary = columns.find((c) => c.primary) || columns[0];
              return (
                <li
                  key={row[rowKey]}
                  className="rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-sm"
                >
                  <div
                    className={cn("font-semibold text-primary-900", onRowClick && "cursor-pointer")}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {cell(primary, row)}
                  </div>
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                    {columns
                      .filter((c) => c !== primary && !c.hideOnMobile)
                      .map((col) => (
                        <div key={col.key} className="contents">
                          <dt className="text-muted">{col.header}</dt>
                          <dd className="text-right text-ink">{cell(col, row)}</dd>
                        </div>
                      ))}
                  </dl>
                </li>
              );
            })}
      </ul>

      {!loading && onPageChange ? (
        <Pagination page={page} pageSize={pageSize} totalCount={totalCount} onPageChange={onPageChange} />
      ) : null}
    </div>
  );
}
