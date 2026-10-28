import { useLocale, useTranslations } from "next-intl";
import { Stars } from "@/components/reviews/Stars";
import { formatDate } from "@/lib/utils/format";

/** Approved guest review. The text is rendered as plain text only. */
export function ReviewCard({ review }) {
  const t = useTranslations("reviews");
  const locale = useLocale();
  return (
    <figure className="flex h-full flex-col rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
      <Stars rating={review.rating} label={t("stars", { count: Number(review.rating) || 0 })} />
      <blockquote className="mt-3 flex-1 whitespace-pre-line text-ink">{review.text}</blockquote>
      <figcaption className="mt-4 text-sm text-muted">
        <span className="font-semibold text-primary-900">{review.name}</span>
        {review.createdAt ? <span> · {formatDate(review.createdAt, locale, { month: "short", year: "numeric" })}</span> : null}
      </figcaption>
    </figure>
  );
}
