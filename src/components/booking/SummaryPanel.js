"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/States";
import { lodge } from "@/config/lodge";
import { formatDate, formatINR } from "@/lib/utils/format";
import { pick } from "@/lib/utils/localize";

/**
 * Step 4. Every amount shown comes from the availability response (backend). Taxes/charges are listed only if the
 * backend supplied them. The browser never adds fees or computes totals. The booking itself is created on confirm.
 */
export function SummaryPanel({ search, option, nights, guest, error, busy, onBack, onConfirm, onChangeSearch }) {
  const t = useTranslations("booking.summary");
  const tc = useTranslations("common");
  const tg = useTranslations("booking.guest");
  const locale = useLocale();
  const money = (v) => formatINR(v, locale);

  const online = guest.paymentMethod === "online";
  const advance = Number(option.advanceAmount);
  const total = Number(option.totalAmount);
  const hasTotals = Number.isFinite(total) && total > 0;
  const taxes = Array.isArray(option.taxes) ? option.taxes.filter((x) => x?.label && Number.isFinite(Number(x.amount))) : [];

  const rows = [
    [t("room"), pick(option.name, locale)],
    [t("dates"), `${formatDate(search.checkIn, locale)} → ${formatDate(search.checkOut, locale)}`],
    [t("nights"), nights],
    [t("guests"), `${tc("adults")}: ${search.adults}${Number(search.children) ? ` · ${tc("children")}: ${search.children}` : ""}`],
    [t("rooms"), search.rooms],
    ...(Number(option.ratePerNight) > 0 ? [[t("rate"), money(option.ratePerNight)]] : []),
    ...taxes.map((x) => [x.label, money(x.amount)]),
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-primary-900">{t("title")}</h2>

      <dl className="divide-y divide-line rounded-[var(--radius-card)] border border-line bg-white">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted">{label}</dt>
            <dd className="text-right font-medium text-ink">{value}</dd>
          </div>
        ))}
        {hasTotals ? (
          <div className="flex justify-between gap-4 bg-surface px-4 py-3">
            <dt className="font-semibold text-primary-900">{t("total")}</dt>
            <dd className="text-xl font-bold text-primary-900">{money(total)}</dd>
          </div>
        ) : null}
        {online && Number.isFinite(advance) && advance > 0 ? (
          <>
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="font-medium text-primary-900">{t("advance")}</dt>
              <dd className="font-bold text-primary-900">{money(advance)}</dd>
            </div>
            {hasTotals && total - advance > 0 ? (
              <div className="flex justify-between gap-4 px-4 py-3">
                <dt className="text-muted">{t("balance")}</dt>
                <dd className="font-medium text-ink">{money(total - advance)}</dd>
              </div>
            ) : null}
          </>
        ) : null}
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-muted">{tg("name")}</dt>
          <dd className="text-right text-ink">
            {guest.name} · {guest.phone}
          </dd>
        </div>
      </dl>

      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-4 text-sm text-ink">
        <h3 className="mb-2 font-semibold text-primary-900">{t("keyPolicies")}</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t("checkInInfo", { time: lodge.checkIn.label })}</li>
          <li>{lodge.checkOut.verified ? t("checkOutInfo", { time: lodge.checkOut.label }) : t("checkOutTbc")}</li>
          <li>{t("cancellationInfo")}</li>
        </ul>
        <Link href="/policies" target="_blank" className="mt-2 inline-block font-medium text-primary underline underline-offset-2">
          {tg("policiesLink")}
        </Link>
      </div>

      <p className="text-sm text-muted">{t("priceNote")}</p>
      {!online ? <Notice tone="info">{t("payAtHotelNote")}</Notice> : null}

      {error ? (
        <Notice tone="error">
          <p>{error.message}</p>
          {error.conflict ? (
            <Button variant="outline" size="sm" className="mt-3" onClick={onChangeSearch}>
              {tc("back")}
            </Button>
          ) : null}
        </Notice>
      ) : null}

      <div className="flex flex-wrap justify-between gap-3">
        <Button variant="outline" onClick={onBack} disabled={busy}>
          {tc("back")}
        </Button>
        <Button variant="accent" size="lg" onClick={onConfirm} loading={busy}>
          {busy ? t("creating") : t("confirmAndContinue")}
        </Button>
      </div>
    </div>
  );
}
