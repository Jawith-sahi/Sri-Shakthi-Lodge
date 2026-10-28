import { useLocale, useTranslations } from "next-intl";
import { LinkButton } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { formatDate } from "@/lib/utils/format";
import { pick } from "@/lib/utils/localize";

export function OfferCard({ offer }) {
  const t = useTranslations("offers");
  const locale = useLocale();
  const title = pick(offer.title, locale);
  const description = pick(offer.description, locale);
  const terms = pick(offer.terms, locale);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-accent-200 bg-white shadow-[var(--shadow-card)]">
      <div className="relative aspect-[16/9] bg-surface">
        <SmartImage
          src={offer.imageUrl || "/placeholders/offer.svg"}
          alt=""
          fill
          sizes="(min-width: 1024px) 352px, (min-width: 640px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-primary-900">{title}</h3>
        {description ? <p className="mt-2 text-sm text-ink">{description}</p> : null}
        {offer.endDate ? (
          <p className="mt-3 text-sm font-medium text-accent-700">{t("validUntil", { date: formatDate(offer.endDate, locale) })}</p>
        ) : null}
        {terms ? (
          <details className="mt-3 text-sm text-muted">
            <summary className="cursor-pointer font-medium text-primary">{t("terms")}</summary>
            <p className="mt-2 whitespace-pre-line">{terms}</p>
          </details>
        ) : null}
        <div className="mt-auto pt-4">
          <LinkButton href={offer.ctaUrl && offer.ctaUrl.startsWith("/") ? offer.ctaUrl : "/booking"} variant="accent" fullWidth>
            {t("bookNow")}
          </LinkButton>
        </div>
      </div>
    </article>
  );
}
