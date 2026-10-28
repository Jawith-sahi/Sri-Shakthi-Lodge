"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Field";
import { Notice } from "@/components/ui/States";
import { submitReview } from "@/lib/api/reviews.api";
import { getErrorMessage } from "@/lib/api/errors";
import { reviewSchema } from "@/lib/schemas";

/** Optional public review form. Submissions are saved as "pending" and only show after an admin approves them. */
export function ReviewForm() {
  const t = useTranslations("reviews");
  const tAll = useTranslations();
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState("");
  const lastSentAt = useRef(0);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { name: "", rating: 5, text: "", website: "" },
  });

  const onSubmit = async (values) => {
    setApiError("");
    if (Date.now() - lastSentAt.current < 20_000) {
      setApiError(getErrorMessage({ code: "rate_limited" }, tAll));
      return;
    }
    try {
      await submitReview(values);
      lastSentAt.current = Date.now();
      setDone(true);
      reset();
    } catch (error) {
      setApiError(getErrorMessage(error, tAll));
    }
  };

  if (done) {
    return (
      <Notice tone="success">
        <p>{t("sent")}</p>
      </Notice>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label={t("write")} className="space-y-4">
      <p className="text-muted">{t("formIntro")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" label={t("name")} required error={errors.name?.message} {...register("name")} />
        <Select name="rating" label={t("rating")} required error={errors.rating?.message} {...register("rating")}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {"★".repeat(n)} ({t("stars", { count: n })})
            </option>
          ))}
        </Select>
      </div>
      <Textarea name="text" label={t("text")} required rows={4} error={errors.text?.message} {...register("text")} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="field-review-website">Website</label>
        <input id="field-review-website" type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      {apiError ? <Notice tone="error">{apiError}</Notice> : null}
      <Button type="submit" loading={isSubmitting}>
        {t("submit")}
      </Button>
    </form>
  );
}
