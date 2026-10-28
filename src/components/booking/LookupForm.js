"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { BookingDetails } from "@/components/booking/BookingDetails";
import { Button, LinkButton } from "@/components/ui/Button";
import { Checkbox, Input, Textarea } from "@/components/ui/Field";
import { Notice } from "@/components/ui/States";
import { cancelBooking, lookupBooking } from "@/lib/api/bookings.api";
import { getErrorMessage } from "@/lib/api/errors";
import { cancelSchema, lookupSchema } from "@/lib/schemas";

function CancelForm({ booking, token, onCancelled }) {
  const t = useTranslations("booking.lookup");
  const tAll = useTranslations();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(cancelSchema),
    defaultValues: { reason: "", accountHolder: "", accountNumber: "", ifsc: "", confirm: false },
  });

  const onSubmit = async (values) => {
    setError("");
    try {
      const updated = await cancelBooking(booking.reference, {
        token,
        reason: values.reason || undefined,
        // Refund bank details go straight to the backend. They are never stored in the browser.
        refund: values.accountNumber
          ? { accountHolder: values.accountHolder, accountNumber: values.accountNumber, ifsc: values.ifsc }
          : undefined,
      });
      reset(); // wipe bank details from the form state immediately
      onCancelled(updated);
    } catch (err) {
      setError(getErrorMessage(err, tAll));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label={t("cancelTitle")} className="space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-5">
      <h2 className="text-xl font-bold text-primary-900">{t("cancelTitle")}</h2>
      <p className="text-muted">{t("cancelIntro")}</p>
      <LinkButton href="/cancellation-policy" variant="ghost" size="sm">
        {t("viewPolicy")}
      </LinkButton>
      <Textarea name="reason" label={t("reason")} rows={2} error={errors.reason?.message} {...register("reason")} />

      {Number(booking.amountPaid) > 0 ? (
        <fieldset className="space-y-4 rounded-lg bg-surface p-4">
          <legend className="px-1 font-semibold text-primary-900">{t("refundTitle")}</legend>
          <p className="text-sm text-muted">{t("refundIntro")}</p>
          <Input name="accountHolder" label={t("accountHolder")} autoComplete="off" error={errors.accountHolder?.message} {...register("accountHolder")} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input name="accountNumber" label={t("accountNumber")} inputMode="numeric" autoComplete="off" error={errors.accountNumber?.message} {...register("accountNumber")} />
            <Input name="ifsc" label={t("ifsc")} autoComplete="off" error={errors.ifsc?.message} {...register("ifsc")} />
          </div>
        </fieldset>
      ) : null}

      <Checkbox name="confirm" label={t("confirm")} error={errors.confirm?.message} {...register("confirm")} />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button type="submit" variant="danger" loading={isSubmitting}>
        {t("cancelButton")}
      </Button>
    </form>
  );
}

export function LookupForm() {
  const t = useTranslations("booking.lookup");
  const tAll = useTranslations();
  const [result, setResult] = useState(null); // { booking, token }
  const [error, setError] = useState("");
  const [cancelledMessage, setCancelledMessage] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(lookupSchema), defaultValues: { reference: "", phone: "" } });

  const onSubmit = async (values) => {
    setError("");
    setCancelledMessage(false);
    try {
      const found = await lookupBooking({ reference: values.reference.trim(), phone: values.phone });
      setResult({ booking: found.booking, token: found.accessToken });
    } catch (err) {
      setResult(null);
      setError(err.code === "not_found" ? t("notFound") : getErrorMessage(err, tAll));
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label={t("heading")} className="space-y-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
        <p className="text-muted">{t("intro")}</p>
        <Input name="reference" label={t("reference")} required autoComplete="off" error={errors.reference?.message} {...register("reference")} />
        <Input
          name="phone"
          label={t("phone")}
          required
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          error={errors.phone?.message}
          {...register("phone")}
        />
        {error ? <Notice tone="error">{error}</Notice> : null}
        <Button type="submit" size="lg" loading={isSubmitting}>
          {t("find")}
        </Button>
      </form>

      {result ? (
        <section aria-live="polite" className="space-y-6">
          {cancelledMessage ? <Notice tone="success">{t("cancelled")}</Notice> : <h2 className="text-xl font-bold text-primary-900">{t("found")}</h2>}
          <BookingDetails booking={result.booking} />
          {result.booking.canCancel ? (
            <CancelForm
              booking={result.booking}
              token={result.token}
              onCancelled={(updated) => {
                setResult((r) => ({ ...r, booking: updated }));
                setCancelledMessage(true);
              }}
            />
          ) : result.booking.status !== "cancelled" ? (
            <Notice tone="info">{t("cannotCancel")}</Notice>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
