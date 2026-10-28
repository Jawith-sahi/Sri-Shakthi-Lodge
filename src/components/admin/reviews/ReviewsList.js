"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterBar, FilterSelect } from "@/components/admin/FilterBar";
import { Stars } from "@/components/reviews/Stars";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { MetaBadge } from "@/components/ui/StatusBadge";
import { REVIEW_STATUS_META } from "@/constants/statuses";
import { useAdminList } from "@/hooks/useAdminList";
import { adminListReviews, adminModerateReview } from "@/lib/api/reviews.api";
import { getAdminErrorMessage } from "@/lib/api/errors";
import { formatDateTimeIST } from "@/lib/utils/format";

export function ReviewsList() {
  const list = useAdminList(adminListReviews, { initialFilters: { status: "pending" }, initialSort: { key: "createdAt", dir: "desc" } });
  const [busyId, setBusyId] = useState(null);

  async function moderate(review, status) {
    setBusyId(review.id);
    try {
      await adminModerateReview(review.id, status);
      toast.success(`Review ${status}.`);
      list.reload();
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setBusyId(null);
    }
  }

  const columns = [
    { key: "name", header: "Guest", primary: true, render: (r) => <span className="font-semibold text-primary-900">{r.name}</span> },
    { key: "rating", header: "Rating", render: (r) => <Stars rating={r.rating} label={`${r.rating} out of 5`} /> },
    { key: "text", header: "Review", render: (r) => <span className="line-clamp-3 max-w-md whitespace-pre-line">{r.text}</span> },
    { key: "createdAt", header: "Date (IST)", sortable: true, hideOnMobile: true, render: (r) => formatDateTimeIST(r.createdAt, "en") },
    { key: "status", header: "Status", render: (r) => <MetaBadge value={r.status} meta={REVIEW_STATUS_META} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      render: (r) => (
        <div className="flex flex-wrap justify-end gap-1">
          {r.status !== "approved" ? <Button size="sm" variant="success" disabled={busyId === r.id} onClick={() => moderate(r, "approved")}>Approve</Button> : null}
          {r.status !== "rejected" ? <Button size="sm" variant="outline" disabled={busyId === r.id} onClick={() => moderate(r, "rejected")}>Reject</Button> : null}
          {r.status === "approved" ? <Button size="sm" variant="ghost" disabled={busyId === r.id} onClick={() => moderate(r, "hidden")}>Hide</Button> : null}
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminPageHeader title="Reviews" description="Only approved reviews appear on the website." />
      <FilterBar q={list.q} onQChange={list.setQ} placeholder="Search reviews…">
        <FilterSelect
          id="review-filter"
          label="Status"
          value={list.filters.status ?? ""}
          onChange={(v) => list.setFilter("status", v)}
          options={[{ value: "", label: "All" }, ...Object.entries(REVIEW_STATUS_META).map(([value, m]) => ({ value, label: m.label }))]}
        />
      </FilterBar>
      <DataTable
        columns={columns}
        rows={list.rows}
        loading={list.loading}
        error={list.error}
        onRetry={list.reload}
        page={list.page}
        pageSize={list.pageSize}
        totalCount={list.totalCount}
        onPageChange={list.setPage}
        sort={list.sort}
        onSortChange={list.setSort}
        emptyTitle="No reviews here"
        emptyBody="Reviews submitted from the website will appear for approval."
        caption="Reviews"
      />
    </>
  );
}
