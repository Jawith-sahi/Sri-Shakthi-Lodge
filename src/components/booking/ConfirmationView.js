"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Clock, Printer, XCircle } from "lucide-react";
import { BookingDetails } from "@/components/booking/BookingDetails";
import { PaymentPanel } from "@/components/booking/PaymentPanel";
import { Button, LinkButton } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { Skeleton } from "@/components/ui/Skeleton";
import { getPublicPhones, getWhatsAppUrl, lodge } from "@/config/lodge";
import { getPublicBooking } from "@/lib/api/bookings.api";

function Banner({ tone, icon: Icon, title, body }) {
  const tones = {
    success: "border-success-600/30 bg-success-50 text-success-700",
    warning: "border-warning-600/30 bg-warning-50 text-warning-700",
    error: "border-danger-600/30 bg-danger-50 text-danger-700",
  };
  return (
    <div role="status" className={`flex gap-4 rounded-[var(--radius-card)] border p-5 ${tones[tone]}`}>
      <Icon className="mt-0.5 h-8 w-8 shrink-0" aria-hidden="true" />
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-1">{body}</p>
      </div>
    </div>
  );
}

/**
 * Shows the booking exactly as the backend reports it.
 * "Confirmed" appears ONLY when the backend status is confirmed; an unpaid / unverified booking is never shown as confirmed.
 */
export function ConfirmationView({ reference, token }) {
  const t = useTranslations("booking.confirmation");
  const tAll = useTranslations();
  const [booking, setBooking] = useState(null);
  const [state, setState] = useState(reference ? "loading" : "missing"); // loading | ready | error | missing

  const load = useCallback(
    async (signal) => {
      if (!reference || !token) {
        setState("missing");
        return;
      }
      setState("loading");
      try {
        setBooking(await getPublicBooking(reference, token, { signal }));
        setState("ready");
      } catch (error) {
        if (!error.isAborted) setState("error");
      }
    },
    [reference, token]
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  if (state === "missing") {
    return (
      <ErrorState
        title={t("heading")}
        body={t("missing")}
        action={<LinkButton href="/booking/lookup">{t("findBooking")}</LinkButton>}
      />
    );
  }
  if (state === "loading") {
    return (
      <div className="space-y-4" role="status" aria-label={tAll("common.loading")}>
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (state === "error" || !booking) {
    return (
      <ErrorState
        title={t("heading")}
        body={t("loadError")}
        action={
          <>
            <Button variant="outline" onClick={() => load()}>
              {tAll("common.retry")}
            </Button>
            <LinkButton href="/booking/lookup">{t("findBooking")}</LinkButton>
          </>
        }
      />
    );
  }

  const phones = getPublicPhones();
  const whatsappUrl = getWhatsAppUrl();
  const awaitingPayment = booking.status === "pending" && booking.canPay;

  let banner;
  if (booking.status === "cancelled") banner = <Banner tone="error" icon={XCircle} title={t("cancelledTitle")} body="" />;
  else if (booking.status === "confirmed" || booking.status === "checked_in" || booking.status === "checked_out")
    banner = <Banner tone="success" icon={CheckCircle2} title={t("confirmedTitle")} body={t("confirmedBody")} />;
  else if (awaitingPayment) banner = <Banner tone="warning" icon={Clock} title={t("awaitingPaymentTitle")} body={t("awaitingPaymentBody")} />;
  else banner = <Banner tone="warning" icon={Clock} title={t("pendingTitle")} body={t("pendingBody")} />;

  return (
    <div className="space-y-6">
      {banner}

      <BookingDetails booking={booking} />

      {awaitingPayment ? (
        <PaymentPanel reference={booking.reference} token={token} advanceAmount={booking.advanceAmount} onVerified={() => load()} />
      ) : null}

      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 text-sm text-ink">
        <h3 className="mb-2 font-semibold text-primary-900">{t("nextTitle")}</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>{t("next1")}</li>
          <li>{t("next2", { time: lodge.checkIn.label })}</li>
          <li>{t("next3")}</li>
        </ul>
      </div>

      <div className="flex flex-wrap gap-3 print:hidden">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden="true" /> {tAll("common.print")}
        </Button>
        {phones[0] ? (
          <LinkButton external href={`tel:${phones[0].tel}`} variant="outline">
            {phones[0].display}
          </LinkButton>
        ) : null}
        {whatsappUrl ? (
          <LinkButton external href={whatsappUrl} variant="outline">
            {tAll("nav.whatsapp")}
          </LinkButton>
        ) : null}
        <LinkButton href="/booking/lookup" variant="ghost">
          {t("findBooking")}
        </LinkButton>
      </div>
    </div>
  );
}
