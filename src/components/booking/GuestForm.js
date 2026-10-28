"use client";

import { useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/Button";
import { Checkbox, Input, Textarea } from "@/components/ui/Field";
import { FormErrorSummary } from "@/components/ui/FieldError";
import { guestSchema } from "@/lib/schemas";
import { cn } from "@/lib/utils/cn";

function PaymentChoice({ value, title, hint, register, checked }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
        checked ? "border-primary bg-primary-50" : "border-line bg-white hover:bg-surface"
      )}
    >
      <input type="radio" value={value} className="mt-1 h-5 w-5 accent-[var(--color-primary-800)]" {...register("paymentMethod")} />
      <span>
        <span className="block font-semibold text-primary-900">{title}</span>
        <span className="mt-0.5 block text-sm text-muted">{hint}</span>
      </span>
    </label>
  );
}

/** Step 3. No ID documents are requested - only what is needed to hold the booking. */
export function GuestForm({ defaultValues, allowOnline, onSubmit, onBack }) {
  const t = useTranslations("booking.guest");
  const tc = useTranslations("common");
  const tv = useTranslations("validation");
  const tb = useTranslations("booking");
  const summaryRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, submitCount },
  } = useForm({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      arrivalTime: "",
      notes: "",
      paymentMethod: allowOnline ? "online" : "payAtHotel",
      acceptPolicies: false,
      ...defaultValues,
    },
  });
  const method = watch("paymentMethod");

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => summaryRef.current?.focus())}
      noValidate
      aria-label={t("title")}
      className="space-y-5"
    >
      <h2 className="text-xl font-bold text-primary-900">{t("title")}</h2>

      {submitCount > 0 ? (
        <FormErrorSummary
          errors={errors}
          title={tv("summaryTitle")}
          focusRef={summaryRef}
          labels={{ name: t("name"), phone: t("phone"), email: t("email"), acceptPolicies: t("acceptPolicies") }}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label={t("name")} required autoComplete="name" error={errors.name?.message} {...register("name")} />
        <Input
          name="phone"
          label={t("phone")}
          hint={t("phoneHint")}
          required
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>
      <Input
        name="email"
        label={t("email")}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input name="arrivalTime" label={t("arrivalTime")} hint={t("arrivalHint")} error={errors.arrivalTime?.message} {...register("arrivalTime")} />
      <Textarea name="notes" label={t("notes")} rows={3} error={errors.notes?.message} {...register("notes")} />

      <fieldset className="space-y-3">
        <legend className="mb-1 text-sm font-medium text-primary-900">{t("paymentMethod")}</legend>
        {allowOnline ? (
          <PaymentChoice value="online" title={t("payOnline")} hint={t("payOnlineHint")} register={register} checked={method === "online"} />
        ) : null}
        <PaymentChoice value="payAtHotel" title={t("payAtHotel")} hint={t("payAtHotelHint")} register={register} checked={method === "payAtHotel"} />
      </fieldset>

      <p className="rounded-lg bg-surface px-4 py-3 text-sm text-muted">{t("noId")}</p>

      <div>
        <Checkbox
          name="acceptPolicies"
          error={errors.acceptPolicies?.message}
          label={
            <>
              {t("acceptPolicies")}{" "}
              <Link href="/policies" target="_blank" className="font-medium text-primary underline underline-offset-2">
                {t("policiesLink")}
              </Link>
            </>
          }
          {...register("acceptPolicies")}
        />
      </div>

      <div className="flex flex-wrap justify-between gap-3 pt-2">
        <Button variant="outline" onClick={onBack}>
          {tc("back")}
        </Button>
        <Button type="submit" variant="accent" size="lg">
          {tb("summary.title")} →
        </Button>
      </div>
    </form>
  );
}
