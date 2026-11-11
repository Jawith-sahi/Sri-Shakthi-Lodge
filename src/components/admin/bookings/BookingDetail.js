"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, LinkButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/States";
import { Skeleton } from "@/components/ui/Skeleton";
import { MetaBadge } from "@/components/ui/StatusBadge";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BOOKING_STATUS_META, BOOKING_TRANSITIONS, PAYMENT_STATUS_META } from "@/constants/statuses";
import { adminCancelBooking, adminGetBooking, adminUpdateBookingStatus } from "@/lib/api/bookings.api";
import { getAdminErrorMessage } from "@/lib/api/errors";
import { formatDate, formatDateTimeIST, formatINR } from "@/lib/utils/format";

function Row({ label, children }) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[11rem_1fr] sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className="text-ink">{children || "—"}</dd>
    </div>
  );
}

const ACTION_LABEL = { confirmed: "Confirm", checked_in: "Check in", checked_out: "Check out", cancelled: "Cancel booking" };

export function BookingDetail({ id }) {
  const [state, setState] = useState({ loading: true, booking: null, error: null });
  const [pending, setPending] = useState(null); // status awaiting confirmation

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      setState({ loading: false, booking: await adminGetBooking(id), error: null });
    } catch (error) {
      setState({ loading: false, booking: null, error });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const { loading, booking, error } = state;

  if (loading && !booking) return <Skeleton className="h-96 w-full" />;
  if (error || !booking) {
    return (
      <ErrorState
        title={error?.code === "not_found" || !booking ? "Booking not found" : "We could not load this booking"}
        body={error ? getAdminErrorMessage(error) : "We could not find the requested booking."}
        action={
          <>
            <Button variant="outline" onClick={load}>Try again</Button>
            <LinkButton plain href="/admin/bookings" variant="ghost">Back to bookings</LinkButton>
          </>
        }
      />
    );
  }

  // The backend says which moves are allowed; the built-in map is only a fallback hint.
  const allowed = booking?.allowedTransitions || (booking?.status ? BOOKING_TRANSITIONS[booking.status] : []) || [];

  async function applyStatus() {
    try {
      const updated =
        pending === "cancelled" ? await adminCancelBooking(booking.id) : await adminUpdateBookingStatus(booking.id, pending);
      const nextBooking = updated || (await adminGetBooking(booking.id));
      setState({ loading: false, booking: nextBooking, error: null });
      toast.success("Booking updated.");
    } catch (err) {
      toast.error(getAdminErrorMessage(err));
    } finally {
      setPending(null);
    }
  }

  return (
    <>
      <AdminPageHeader
        title={`Booking ${booking.reference}`}
        description={`Created ${formatDateTimeIST(booking.createdAt, "en")} (IST) · ${booking.source === "walk-in" ? "Walk-in" : "Online"}`}
        actions={
          <>
            {allowed
              .filter((s) => s !== "cancelled")
              .map((s) => (
                <Button key={s} onClick={() => setPending(s)}>
                  {ACTION_LABEL[s] || s}
                </Button>
              ))}
            {allowed.includes("cancelled") ? (
              <Button variant="danger" onClick={() => setPending("cancelled")}>
                {ACTION_LABEL.cancelled}
              </Button>
            ) : null}
            <LinkButton plain href="/admin/bookings" variant="outline">
              Back
            </LinkButton>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="stay-title">
          <h2 id="stay-title" className="mb-2 text-lg font-semibold text-primary-900">Stay</h2>
          <dl className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
            <Row label="Status"><MetaBadge value={booking.status} meta={BOOKING_STATUS_META} /></Row>
            <Row label="Room">{booking.roomName}{booking.roomNumber ? ` · ${booking.roomNumber}` : ""}</Row>
            <Row label="Check-in">{formatDate(booking.checkIn, "en")}</Row>
            <Row label="Check-out">{formatDate(booking.checkOut, "en")}</Row>
            <Row label="Nights">{booking.nights}</Row>
            <Row label="Guests">{`${booking.adults} adult(s)${booking.children ? `, ${booking.children} child(ren)` : ""} · ${booking.rooms} room(s)`}</Row>
            <Row label="Notes">{booking.notes}</Row>
          </dl>
        </section>

        <section aria-labelledby="guest-title">
          <h2 id="guest-title" className="mb-2 text-lg font-semibold text-primary-900">Guest</h2>
          <dl className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
            <Row label="Name">{booking.guest?.name}</Row>
            <Row label="Phone">{booking.guest?.phone ? <a className="text-primary underline" href={`tel:+91${booking.guest.phone}`}>{booking.guest.phone}</a> : null}</Row>
            <Row label="Email">{booking.guest?.email}</Row>
            <Row label="ID type">{booking.guest?.idType}</Row>
          </dl>
        </section>

        <section aria-labelledby="pay-title">
          <h2 id="pay-title" className="mb-2 text-lg font-semibold text-primary-900">Payment</h2>
          <dl className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
            <Row label="Payment status"><MetaBadge value={booking.paymentStatus} meta={PAYMENT_STATUS_META} /></Row>
            <Row label="Total">{formatINR(booking.totalAmount)}</Row>
            <Row label="Paid">{formatINR(booking.amountPaid)}</Row>
            <Row label="Balance">{formatINR(booking.balanceAmount)}</Row>
          </dl>
          {booking.payments?.length ? (
            <ul className="mt-3 divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white text-sm">
              {booking.payments.map((p) => (
                <li key={p.id} className="flex flex-wrap justify-between gap-2 px-4 py-2.5">
                  <span className="capitalize">{p.method} · {p.status}{p.reference ? ` · ${p.reference}` : ""}</span>
                  <span>{formatINR(p.amount)} · {formatDateTimeIST(p.paidAt, "en")}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section aria-labelledby="history-title">
          <h2 id="history-title" className="mb-2 text-lg font-semibold text-primary-900">History</h2>
          <ol className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white text-sm">
            {(booking.history || []).map((h, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5">
                <MetaBadge value={h.status} meta={BOOKING_STATUS_META} />
                <span className="text-muted">{formatDateTimeIST(h.at, "en")} · {h.by}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        onClose={() => setPending(null)}
        title={pending === "cancelled" ? "Cancel this booking?" : `${ACTION_LABEL[pending] || "Change status"}?`}
        message={
          pending === "cancelled"
            ? "The guest's room will be released. If money was paid, remember to process the refund as per the lodge policy."
            : `The booking will be marked as "${BOOKING_STATUS_META[pending]?.label || pending}".`
        }
        confirmLabel={ACTION_LABEL[pending] || "Confirm"}
        danger={pending === "cancelled"}
        onConfirm={applyStatus}
      />
    </>
  );
}
