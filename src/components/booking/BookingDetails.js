"use client";

import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatINR } from "@/lib/utils/format";

const STATUS_TONE = { pending: "amber", confirmed: "green", checked_in: "green", checked_out: "gray", cancelled: "red" };
const PAYMENT_TONE = { unpaid: "amber", partial: "blue", paid: "green", failed: "red", refund_pending: "amber", refunded: "gray" };

/** Read-only booking facts exactly as the backend reports them (nothing is computed or assumed here). */
export function BookingDetails({ booking }) {
  const t = useTranslations("booking");
  const tc = useTranslations("common");
  const locale = useLocale();

  const money = (v) => formatINR(v, locale);
  const rows = [
    [t("confirmation.reference"), <span key="r" className="font-mono font-semibold">{booking.reference}</span>],
    [
      t("confirmation.status"),
      <StatusBadge key="s" tone={STATUS_TONE[booking.status] || "gray"}>
        {t.has(`status.${booking.status}`) ? t(`status.${booking.status}`) : booking.status}
      </StatusBadge>,
    ],
    [
      t("confirmation.paymentStatus"),
      <StatusBadge key="p" tone={PAYMENT_TONE[booking.paymentStatus] || "gray"}>
        {t.has(`paymentStatus.${booking.paymentStatus}`) ? t(`paymentStatus.${booking.paymentStatus}`) : booking.paymentStatus}
      </StatusBadge>,
    ],
    [t("confirmation.guestName"), booking.guestName],
    [t("confirmation.room"), booking.roomName],
    [
      t("confirmation.dates"),
      `${formatDate(booking.checkIn, locale)} → ${formatDate(booking.checkOut, locale)} (${tc("nights", { count: booking.nights })})`,
    ],
    [
      t("confirmation.guests"),
      `${tc("adults")}: ${booking.adults}${booking.children ? ` · ${tc("children")}: ${booking.children}` : ""} · ${tc("roomsCount", { count: booking.rooms })}`,
    ],
    [t("confirmation.total"), money(booking.totalAmount)],
    // "Amount paid" is shown only when the backend says money was actually received
    ...(Number(booking.amountPaid) > 0 ? [[t("confirmation.amountPaid"), money(booking.amountPaid)]] : []),
    ...(Number(booking.balanceAmount) > 0 ? [[t("confirmation.balance"), money(booking.balanceAmount)]] : []),
  ].filter(([, value]) => value !== null && value !== undefined && value !== "");

  return (
    <dl className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
      {rows.map(([label, value]) => (
        <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr] sm:gap-4">
          <dt className="text-sm text-muted">{label}</dt>
          <dd className="text-ink">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
