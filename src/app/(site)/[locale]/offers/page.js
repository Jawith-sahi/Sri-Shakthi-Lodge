import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { RetryButton } from "@/components/common/RetryButton";
import { OfferCard } from "@/components/home/OfferCard";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { getOffers } from "@/lib/api/offers.api";
import { settle } from "@/lib/api/client";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.offers" });
  return buildMetadata({ locale, path: "/offers", title: t("title"), description: t("description") });
}

export default async function OffersPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tNav, tErr] = await Promise.all([getTranslations("offers"), getTranslations("nav"), getTranslations("errors")]);
  const { data: offers, error } = await settle(getOffers());
  const failed = error && error.code !== "not_configured";

  return (
    <>
      <PageHeader title={t("heading")} />
      <Breadcrumbs items={[{ name: tNav("home"), href: "/" }, { name: tNav("offers") }]} />
      <Section>
        {offers?.length ? (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <li key={offer.id}>
                <OfferCard offer={offer} />
              </li>
            ))}
          </ul>
        ) : failed ? (
          <ErrorState title={tErr("pageTitle")} body={tErr("dataUnavailable")} action={<RetryButton />} />
        ) : (
          <EmptyState
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={<LinkButton href="/contact">{tNav("contact")}</LinkButton>}
          />
        )}
      </Section>
    </>
  );
}
