"use client";

import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { FilterBar } from "@/components/admin/FilterBar";
import { Button, LinkButton } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ErrorState } from "@/components/ui/States";
import { Skeleton } from "@/components/ui/Skeleton";
import { MetaBadge } from "@/components/ui/StatusBadge";
import { BOOKING_STATUS_META } from "@/constants/statuses";
import { useAdminList } from "@/hooks/useAdminList";
import { adminGetGuest, adminListGuests } from "@/lib/api/guests.api";
import { getAdminErrorMessage } from "@/lib/api/errors";
import { formatDate, formatINR } from "@/lib/utils/format";

function GuestDetail({ id }) {
  const [state, setState] = useState({ loading: true, data: null, error: null });

  useEffect(() => {
    let alive = true;
    setState({ loading: true, data: null, error: null });
    adminGetGuest(id)
      .then((data) => alive && setState({ loading: false, data, error: null }))
      .catch((error) => alive && setState({ loading: false, data: null, error: getAdminErrorMessage(error) }));
    return () => {
      alive = false;
    };
  }, [id]);

  if (state.loading) return <Skeleton className="h-40 w-full" />;
  if (state.error) return <ErrorState title="We could not load this guest" body={state.error} />;
  const g = state.data;
  return (
    <div className="space-y-4 text-sm">
      <dl className="grid gap-2 sm:grid-cols-2">
        <div><dt className="text-muted">Name</dt><dd className="font-medium">{g.name}</dd></div>
        <div><dt className="text-muted">Phone</dt><dd>{g.phone}</dd></div>
        <div><dt className="text-muted">Email</dt><dd>{g.email || "—"}</dd></div>
        <div><dt className="text-muted">ID type</dt><dd>{g.idType || "—"}</dd></div>
      </dl>
      <p className="rounded-lg bg-surface px-3 py-2 text-xs text-muted">ID numbers are never shown here. Check them in the lodge&apos;s own register.</p>
      <h3 className="font-semibold text-primary-900">Booking history</h3>
      <ul className="divide-y divide-line rounded-lg border border-line">
        {(g.history || []).map((h) => (
          <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
            <LinkButton plain href={`/admin/bookings/${h.id}`} variant="ghost" size="sm">{h.reference}</LinkButton>
            <span>{h.roomName} · {formatDate(h.checkIn, "en")} → {formatDate(h.checkOut, "en")}</span>
            <span>{formatINR(h.totalAmount)}</span>
            <MetaBadge value={h.status} meta={BOOKING_STATUS_META} />
          </li>
        ))}
        {!g.history?.length ? <li className="px-3 py-2 text-muted">No bookings.</li> : null}
      </ul>
    </div>
  );
}

export function GuestsList() {
  const list = useAdminList(adminListGuests);
  const [openId, setOpenId] = useState(null);

  const columns = [
    { key: "name", header: "Guest", primary: true, sortable: true, render: (g) => <span className="font-semibold text-primary-900">{g.name}</span> },
    { key: "phone", header: "Phone", render: (g) => g.phone },
    { key: "email", header: "Email", hideOnMobile: true, render: (g) => g.email || "—" },
    { key: "idType", header: "ID type", hideOnMobile: true, render: (g) => g.idType || "—" },
    { key: "lastRoomNumber", header: "Last room", render: (g) => g.lastRoomNumber || "—" },
    { key: "lastCheckIn", header: "Last stay", sortable: true, render: (g) => (g.lastCheckIn ? `${formatDate(g.lastCheckIn, "en")} → ${formatDate(g.lastCheckOut, "en")}` : "—") },
    { key: "bookingsCount", header: "Bookings", render: (g) => g.bookingsCount ?? 0 },
    { key: "actions", header: "", className: "text-right", render: (g) => <Button variant="ghost" size="sm" onClick={() => setOpenId(g.id)}>View</Button> },
  ];

  return (
    <>
      <AdminPageHeader title="Guests" description="Everyone who has booked or stayed. Personal data is private: handle it with care." />
      <FilterBar q={list.q} onQChange={list.setQ} placeholder="Name, phone or email…" />
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
        emptyTitle="No guests found"
        caption="Guests"
      />
      <Modal open={Boolean(openId)} onClose={() => setOpenId(null)} title="Guest details" size="lg">
        {openId ? <GuestDetail id={openId} /> : null}
      </Modal>
    </>
  );
}
