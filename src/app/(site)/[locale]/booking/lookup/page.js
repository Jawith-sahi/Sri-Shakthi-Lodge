import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { LookupForm } from "@/components/booking/LookupForm";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.bookingLookup" });
  return buildMetadata({ locale, path: "/booking/lookup", title: t("title"), description: t("description"), noindex: true });
}

export default async function BookingLookupPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking.lookup");
  return (
    <>
      <PageHeader title={t("heading")} />
      <Section>
        <div className="mx-auto max-w-2xl">
          <LookupForm />
        </div>
      </Section>
    </>
  );
}
