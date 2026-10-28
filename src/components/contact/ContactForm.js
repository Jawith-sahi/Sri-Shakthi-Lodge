"use client";

import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Field";
import { FormErrorSummary } from "@/components/ui/FieldError";
import { Notice } from "@/components/ui/States";
import { TurnstileWidget } from "@/components/contact/TurnstileWidget";
import { env } from "@/config/environment";
import { submitEnquiry } from "@/lib/api/enquiries.api";
import { getErrorMessage } from "@/lib/api/errors";
import { contactSchema } from "@/lib/schemas";

const THROTTLE_MS = 20_000; // browser-side courtesy limit; the backend must rate-limit as well

export function ContactForm() {
  const t = useTranslations("contact");
  const tv = useTranslations("validation");
  const tc = useTranslations("common");
  const tAll = useTranslations();
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const lastSentAt = useRef(0);
  const summaryRef = useRef(null);
  const handleToken = useCallback((token) => setCaptchaToken(token), []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, submitCount },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", phone: "", email: "", subject: "", message: "", website: "" },
  });

  const onSubmit = async (values) => {
    setApiError("");
    if (Date.now() - lastSentAt.current < THROTTLE_MS) {
      setApiError(getErrorMessage({ code: "rate_limited" }, tAll));
      return;
    }
    if (env.turnstileSiteKey && !captchaToken) {
      setApiError(getErrorMessage({ code: "validation" }, tAll));
      return;
    }
    try {
      await submitEnquiry({ ...values, ...(captchaToken ? { captchaToken } : {}) });
      lastSentAt.current = Date.now();
      setSent(true);
      reset();
    } catch (error) {
      setApiError(getErrorMessage(error, tAll));
    }
  };

  if (sent) {
    return (
      <div role="status" className="rounded-[var(--radius-card)] border border-success-600/30 bg-success-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-success-600" aria-hidden="true" />
        <h3 className="mt-3 text-lg font-semibold text-success-700">{t("sentTitle")}</h3>
        <p className="mt-2 text-success-700">{t("sent")}</p>
        <Button variant="outline" className="mt-5" onClick={() => setSent(false)}>
          {t("sendAnother")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label={t("formTitle")} className="space-y-4">
      {submitCount > 0 ? (
        <FormErrorSummary
          errors={errors}
          title={tv("summaryTitle")}
          labels={{ name: t("name"), phone: t("phone"), email: t("email"), subject: t("subject"), message: t("message") }}
          focusRef={summaryRef}
        />
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label={t("name")} required autoComplete="name" error={errors.name?.message} {...register("name")} />
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
      </div>
      <Input
        name="email"
        label={t("email")}
        optionalText={tc("optional")}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <Input name="subject" label={t("subject")} required error={errors.subject?.message} {...register("subject")} />
      <Textarea name="message" label={t("message")} required rows={5} error={errors.message?.message} {...register("message")} />

      {/* Honeypot: hidden from people, tempting for bots. Backend ignores submissions where it is filled. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="field-website">Website</label>
        <input id="field-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>

      <TurnstileWidget onToken={handleToken} />

      {apiError ? <Notice tone="error">{apiError}</Notice> : null}

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        {isSubmitting ? t("sending") : t("send")}
      </Button>
    </form>
  );
}
