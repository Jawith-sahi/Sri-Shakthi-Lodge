import { getTranslations, setRequestLocale } from "next-intl/server";
import { XCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { LinkButton } from "@/components/ui/Button";
import { getPrimaryPhone, getWhatsAppUrl } from "@/config/lodge";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.bookingCancelled" });
  return buildMetadata({ locale, path: "/booking/cancelled", title: t("title"), noindex: true });
}

/** Landing page for a cancelled / failed payment (also usable as a gateway redirect target). */
export default async function BookingCancelledPage({ params, searchParams }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const t = await getTranslations("booking.cancelledPage");
  const tNav = await getTranslations("nav");
  const reference = typeof query.ref === "string" ? query.ref : "";
  const token = typeof query.token === "string" ? query.token : "";
  const phone = getPrimaryPhone();
  const whatsappUrl = getWhatsAppUrl();

  return (
    <>
      <PageHeader title={t("heading")} />
      <Section>
        <div className="mx-auto max-w-xl text-center">
          <XCircle className="mx-auto h-14 w-14 text-danger-600" aria-hidden="true" />
          <p className="mt-4 text-lg text-ink">{t("body")}</p>
          {reference ? <p className="mt-3 font-mono font-semibold text-primary-900">{t("reference", { reference })}</p> : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {reference && token ? (
              <LinkButton href={`/booking/success?ref=${encodeURIComponent(reference)}&token=${encodeURIComponent(token)}`} variant="accent">
                {t("tryAgain")}
              </LinkButton>
            ) : (
              <LinkButton href="/booking/lookup" variant="accent">
                {tNav("findBooking")}
              </LinkButton>
            )}
            {phone ? (
              <LinkButton external href={`tel:${phone.tel}`} variant="outline">
                {tNav("callNow")}
              </LinkButton>
            ) : null}
            {whatsappUrl ? (
              <LinkButton external href={whatsappUrl} variant="outline">
                {tNav("whatsapp")}
              </LinkButton>
            ) : null}
          </div>
          <p className="mt-6 text-sm text-muted">{t("contact")}</p>
        </div>
      </Section>
    </>
  );
}
