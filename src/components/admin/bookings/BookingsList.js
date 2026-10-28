"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Plus } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterBar, FilterDate, FilterSelect } from "@/components/admin/FilterBar";
import { WalkInDialog } from "@/components/admin/bookings/WalkInDialog";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { MetaBadge } from "@/components/ui/StatusBadge";
import { BOOKING_STATUS_META, PAYMENT_STATUS_META } from "@/constants/statuses";
import { useAdminList } from "@/hooks/useAdminList";
import { saveBlob } from "@/lib/api/client";
import { adminListBookings } from "@/lib/api/bookings.api";
import { getAdminErrorMessage } from "@/lib/api/errors";
import { exportReport } from "@/lib/api/reports.api";
import { formatDate, formatDateTimeIST, formatINR, maskPhone } from "@/lib/utils/format";

export function BookingsList() {
  const router = useRouter();
  const list = useAdminList(adminListBookings, { initialSort: { key: "createdAt", dir: "desc" } });
  const [walkIn, setWalkIn] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function exportCsv() {
    setExporting(true);
    try {
      // Server-generated file for the current date range - never assembled from rows in the browser.
      const { blob, filename } = await exportReport({
        type: "bookings",
        from: list.filters.from,
        to: list.filters.to,
        format: "csv",
      });
      saveBlob(blob, filename || "bookings.csv");
    } catch (error) {
      toast.error(getAdminErrorMessage(error));
    } finally {
      setExporting(false);
    }
  }

  const columns = [
    { key: "reference", header: "Reference", primary: true, sortable: true, render: (b) => <span className="font-mono font-semibold text-primary">{b.reference}</span> },
    { key: "guestName", header: "Guest", render: (b) => b.guestName },
    { key: "guestPhone", header: "Phone", hideOnMobile: true, render: (b) => maskPhone(b.guestPhone) },
    { key: "roomName", header: "Room", render: (b) => b.roomName },
    { key: "checkIn", header: "Check-in", sortable: true, render: (b) => formatDate(b.checkIn, "en") },
    { key: "checkOut", header: "Check-out", render: (b) => formatDate(b.checkOut, "en") },
    { key: "totalAmount", header: "Total", render: (b) => formatINR(b.totalAmount) || "—" },
    { key: "paymentStatus", header: "Payment", render: (b) => <MetaBadge value={b.paymentStatus} meta={PAYMENT_STATUS_META} /> },
    { key: "status", header: "Status", render: (b) => <MetaBadge value={b.status} meta={BOOKING_STATUS_META} /> },
    { key: "createdAt", header: "Created (IST)", sortable: true, hideOnMobile: true, render: (b) => formatDateTimeIST(b.createdAt, "en") },
  ];

  return (
    <>
      <AdminPageHeader
        title="Bookings"
        description="All online and walk-in bookings. Dates and times are in India time (IST)."
        actions={
          <>
            <Button variant="outline" onClick={exportCsv} loading={exporting}>
              <Download className="h-4 w-4" aria-hidden="true" /> Export CSV
            </Button>
            <Button onClick={() => setWalkIn(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" /> Walk-in booking
            </Button>
          </>
        }
      />

      <FilterBar q={list.q} onQChange={list.setQ} placeholder="Reference, guest name or phone…">
        <FilterSelect
          id="booking-status"
          label="Status"
          value={list.filters.status || ""}
          onChange={(v) => list.setFilter("status", v)}
          options={[{ value: "", label: "All" }, ...Object.entries(BOOKING_STATUS_META).map(([value, m]) => ({ value, label: m.label }))]}
        />
        <FilterSelect
          id="booking-payment"
          label="Payment"
          value={list.filters.paymentStatus || ""}
          onChange={(v) => list.setFilter("paymentStatus", v)}
          options={[{ value: "", label: "All" }, ...Object.entries(PAYMENT_STATUS_META).map(([value, m]) => ({ value, label: m.label }))]}
        />
        <FilterDate id="booking-from" label="Check-in from" value={list.filters.from} onChange={(v) => list.setFilter("from", v)} />
        <FilterDate id="booking-to" label="Check-in to" value={list.filters.to} onChange={(v) => list.setFilter("to", v)} />
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
        onRowClick={(b) => router.push(`/admin/bookings/${b.id}`)}
        emptyTitle="No bookings found"
        emptyBody="Try different filters, or create a walk-in booking."
        caption="Bookings"
      />

      <WalkInDialog
        open={walkIn}
        onClose={() => setWalkIn(false)}
        onCreated={(booking) => {
          setWalkIn(false);
          toast.success("Walk-in booking created.");
          router.push(`/admin/bookings/${booking.id}`);
        }}
      />
    </>
  );
}
