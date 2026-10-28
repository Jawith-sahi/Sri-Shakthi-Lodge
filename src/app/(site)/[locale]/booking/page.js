import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { BookingFlow } from "@/components/booking/BookingFlow";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { LinkButton } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.booking" });
  return buildMetadata({ locale, path: "/booking", title: t("title"), description: t("description") });
}

export default async function BookingPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking");
  const tLookup = await getTranslations("booking.lookup");

  return (
    <>
      <PageHeader title={t("heading")} subtitle={t("intro")} />
      <Section>
        {/* useSearchParams() inside BookingFlow needs a Suspense boundary */}
        <Suspense fallback={<PageSkeleton />}>
          <BookingFlow />
        </Suspense>
        <p className="mt-10 text-center">
          <LinkButton href="/booking/lookup" variant="ghost">
            {tLookup("heading")}
          </LinkButton>
        </p>
      </Section>
    </>
  );
}
