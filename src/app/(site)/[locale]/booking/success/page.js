import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { ConfirmationView } from "@/components/booking/ConfirmationView";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.bookingSuccess" });
  // Personal booking page: never indexed.
  return buildMetadata({ locale, path: "/booking/success", title: t("title"), noindex: true });
}

export default async function BookingSuccessPage({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const t = await getTranslations("booking.confirmation");
  const reference = typeof query.ref === "string" ? query.ref : "";
  const token = typeof query.token === "string" ? query.token : "";

  return (
    <>
      <PageHeader title={t("heading")} />
      <Section>
        <div className="mx-auto max-w-2xl">
          <ConfirmationView reference={reference} token={token} />
        </div>
      </Section>
    </>
  );
}
