"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/States";
import { Spinner } from "@/components/ui/Spinner";
import { env } from "@/config/environment";
import { createPaymentOrder, getPaymentStatus, verifyPayment } from "@/lib/api/payments.api";
import { getErrorMessage } from "@/lib/api/errors";
import { getPaymentAdapter } from "@/lib/payments";
import { formatINR } from "@/lib/utils/format";
import { newIdempotencyKey } from "@/lib/utils/idempotency";

/**
 * Payment step. Rules enforced here:
 *  - the amount comes from the backend (`advanceAmount`), never computed in the browser
 *  - the Razorpay script loads only when the guest presses Pay
 *  - a successful browser callback is NOT trusted: ids go to the backend, and `onVerified` fires only when
 *    the backend answers verified === true
 *  - double clicks are ignored while a payment is in progress; nothing is retried automatically
 */
export function PaymentPanel({ reference, token, advanceAmount, onVerified }) {
  const t = useTranslations("booking.payment");
  const tAll = useTranslations();
  const locale = useLocale();

  const [phase, setPhase] = useState("idle"); // idle | preparing | paying | verifying | failed | cancelled | verifyFailed
  const [message, setMessage] = useState("");
  const busy = useRef(false);
  const orderKey = useRef(newIdempotencyKey());
  const adapter = getPaymentAdapter();
  const amountText = formatINR(advanceAmount, locale);

  async function start(simulate = "success") {
    if (busy.current) return;
    busy.current = true;
    setMessage("");
    try {
      setPhase("preparing");
      const order = await createPaymentOrder({ bookingReference: reference, token }, orderKey.current);

      setPhase("paying");
      const result = await adapter.pay(order, simulate);

      if (result.outcome === "cancelled") {
        setPhase("cancelled");
        return;
      }
      if (result.outcome === "failed") {
        setMessage(result.reason === "script-load-failed" ? t("scriptError") : "");
        setPhase("failed");
        return;
      }

      setPhase("verifying");
      const verified = await verifyPayment({
        bookingReference: reference,
        token,
        razorpayOrderId: result.razorpayOrderId,
        razorpayPaymentId: result.razorpayPaymentId,
        razorpaySignature: result.razorpaySignature,
      });
      if (verified?.verified) {
        onVerified(verified);
        return;
      }
      setPhase("verifyFailed");
    } catch (error) {
      setMessage(getErrorMessage(error, tAll));
      // If the failure happened after the guest may have paid, never invite a second payment blindly.
      setPhase((current) => (current === "verifying" ? "verifyFailed" : "failed"));
    } finally {
      busy.current = false;
    }
  }

  async function recheck() {
    if (busy.current) return;
    busy.current = true;
    setMessage("");
    try {
      const status = await getPaymentStatus({ bookingReference: reference, token });
      if (status?.verified) onVerified(status);
      else setMessage(t("verifyFailed", { reference }));
    } catch (error) {
      setMessage(getErrorMessage(error, tAll));
    } finally {
      busy.current = false;
    }
  }

  const retry = () => {
    orderKey.current = newIdempotencyKey();
    setPhase("idle");
    setMessage("");
  };

  const working = phase === "preparing" || phase === "paying" || phase === "verifying";

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
      <h2 className="text-xl font-bold text-primary-900">{t("title")}</h2>
      <p className="mt-2 text-muted">{t("intro", { reference })}</p>

      <p className="mt-5 text-sm text-muted">{t("amount")}</p>
      <p className="text-3xl font-bold text-primary-900">{amountText}</p>

      <div aria-live="polite" className="mt-5 space-y-4">
        {phase === "cancelled" ? (
          <Notice tone="warning" title={t("cancelledTitle")}>
            {t("cancelledBody")}
          </Notice>
        ) : null}
        {phase === "failed" ? (
          <Notice tone="error" title={t("failedTitle")}>
            {message || t("failedBody")}
          </Notice>
        ) : null}
        {phase === "verifyFailed" ? (
          <Notice tone="warning" title={t("failedTitle")}>
            {t("verifyFailed", { reference })}
          </Notice>
        ) : null}
        {message && phase !== "failed" && phase !== "verifyFailed" ? <Notice tone="error">{message}</Notice> : null}
        {working ? (
          <p className="flex items-center gap-2 text-primary-900">
            <Spinner className="h-5 w-5" label={t("preparing")} />
            {phase === "verifying" ? t("verifying") : t("preparing")}
          </p>
        ) : null}
      </div>

      {env.useMock ? (
        <div className="mt-5 rounded-lg border-2 border-dashed border-warning-600 bg-warning-50 p-4">
          <p className="font-semibold text-warning-700">{t("mockTitle")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="success" size="sm" disabled={working} onClick={() => start("success")}>
              {t("mockSuccess")}
            </Button>
            <Button variant="danger" size="sm" disabled={working} onClick={() => start("failed")}>
              {t("mockFail")}
            </Button>
            <Button variant="outline" size="sm" disabled={working} onClick={() => start("cancelled")}>
              {t("mockCancel")}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap gap-3">
          {phase === "verifyFailed" ? (
            <Button variant="primary" size="lg" onClick={recheck}>
              {t("checkStatus")}
            </Button>
          ) : (
            <Button
              variant="accent"
              size="lg"
              loading={working}
              onClick={phase === "failed" || phase === "cancelled" ? () => { retry(); start(); } : () => start()}
            >
              {phase === "failed" || phase === "cancelled" ? t("retry") : t("payNow", { amount: amountText })}
            </Button>
          )}
        </div>
      )}

      <p className="mt-5 flex items-start gap-2 text-sm text-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
        {t("secure")}
      </p>
    </div>
  );
}
