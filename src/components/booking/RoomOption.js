"use client";

import { useLocale, useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatINR } from "@/lib/utils/format";
import { pick } from "@/lib/utils/localize";

/** One available room category in the results list. Prices/availability are exactly what the backend returned. */
export function RoomOption({ option, nights, onSelect, highlighted }) {
  const t = useTranslations("booking.availability");
  const tc = useTranslations("common");
  const locale = useLocale();

  const name = pick(option.name, locale);
  const soldOut = !(Number(option.availableCount) > 0);
  const hasPrice = Number.isFinite(Number(option.ratePerNight)) && Number(option.ratePerNight) > 0;

  return (
    <li
      className={`flex flex-col overflow-hidden rounded-[var(--radius-card)] border bg-white shadow-[var(--shadow-card)] sm:flex-row ${
        highlighted ? "border-accent-500 ring-2 ring-accent-200" : "border-line"
      }`}
    >
      <div className="relative aspect-[16/10] bg-surface sm:aspect-auto sm:w-56 sm:shrink-0">
        <SmartImage src={option.images?.[0]?.url} alt="" fill sizes="(min-width: 640px) 224px, 100vw" className="object-cover" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-primary-900">{name}</h3>
            <StatusBadge tone={option.isAc ? "blue" : "gray"}>{option.isAc ? tc("ac") : tc("nonAc")}</StatusBadge>
          </div>
          {option.maxOccupancy ? (
            <p className="inline-flex items-center gap-1.5 text-sm text-ink">
              <Users className="h-4 w-4 text-primary-500" aria-hidden="true" />
              {tc("upTo", { count: Number(option.maxOccupancy) })}
            </p>
          ) : null}
          {!soldOut && Number(option.availableCount) <= 3 ? (
            <p className="text-sm font-medium text-warning-700">{t("onlyLeft", { count: Number(option.availableCount) })}</p>
          ) : null}
          {option.fitsGuests === false && !soldOut ? <p className="text-sm text-warning-700">{t("doesNotFit")}</p> : null}
        </div>

        <div className="sm:text-right">
          {soldOut ? (
            <p className="font-semibold text-danger-600">{t("soldOut")}</p>
          ) : (
            <>
              {hasPrice ? (
                <>
                  <p className="text-sm text-muted">{t("perNight", { amount: formatINR(option.ratePerNight, locale) })}</p>
                  {Number.isFinite(Number(option.totalAmount)) ? (
                    <p className="text-sm text-muted">
                      {t("totalFor", { nights: tc("nights", { count: nights }) })}{" "}
                      <span className="text-xl font-bold text-primary-900">{formatINR(option.totalAmount, locale)}</span>
                    </p>
                  ) : null}
                </>
              ) : (
                <p className="font-medium text-primary-700">{tc("contactForRates")}</p>
              )}
              <Button variant="accent" className="mt-3 w-full sm:w-auto" onClick={() => onSelect(option)}>
                {t("select")}
              </Button>
            </>
          )}
        </div>
      </div>
    </li>
  );
}
