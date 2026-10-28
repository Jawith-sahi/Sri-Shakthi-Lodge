import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { RetryButton } from "@/components/common/RetryButton";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { getApprovedReviews } from "@/lib/api/reviews.api";
import { settle } from "@/lib/api/client";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.reviews" });
  return buildMetadata({ locale, path: "/reviews", title: t("title"), description: t("description") });
}

export default async function ReviewsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tNav, tErr] = await Promise.all([getTranslations("reviews"), getTranslations("nav"), getTranslations("errors")]);
  const { data: reviews, error } = await settle(getApprovedReviews());
  const failed = error && error.code !== "not_configured";

  return (
    <>
      <PageHeader title={t("heading")} />
      <Breadcrumbs items={[{ name: tNav("home"), href: "/" }, { name: t("heading") }]} />
      <Section>
        {reviews?.length ? (
          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
        ) : failed ? (
          <ErrorState title={tErr("pageTitle")} body={tErr("dataUnavailable")} action={<RetryButton />} />
        ) : (
          <EmptyState title={t("emptyTitle")} body={t("emptyBody")} />
        )}
      </Section>

      <Section tone="muted">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-2xl font-bold text-primary-900">{t("write")}</h2>
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 sm:p-6">
            <ReviewForm />
          </div>
        </div>
      </Section>
    </>
  );
}
