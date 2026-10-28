import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import {
  CancellationSummary,
  CheckInOutPolicy,
  ExtensionPolicy,
  LateCheckoutPolicy,
  PaymentsPolicy,
  RulesPolicy,
  TextBlocks,
} from "@/components/policies/PolicyParts";
import { Notice } from "@/components/ui/States";
import { loadContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { pick } from "@/lib/utils/localize";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.terms" });
  return buildMetadata({ locale, path: "/terms-and-conditions", title: t("title"), description: t("description") });
}

export default async function TermsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tNav, tp, content] = await Promise.all([
    getTranslations("policies.termsPage"),
    getTranslations("nav"),
    getTranslations("policies"),
    loadContent(),
  ]);
  const cmsText = pick(content.policies?.terms, locale);

  return (
    <>
      <PageHeader title={t("heading")} />
      <Breadcrumbs items={[{ name: tNav("home"), href: "/" }, { name: tp("heading"), href: "/policies" }, { name: t("heading") }]} />
      <Section>
        <div className="mx-auto max-w-3xl">
          <div className="prose-policy">
            {cmsText ? (
              <TextBlocks text={cmsText} />
            ) : (
              <>
                <h2>{t("bookings")}</h2>
                <p>{t("bookingsText")}</p>
                <h2>{t("checkInOut")}</h2>
                <CheckInOutPolicy />
                <LateCheckoutPolicy />
                <ExtensionPolicy />
                <h2>{t("payments")}</h2>
                <PaymentsPolicy />
                <h2>{t("rules")}</h2>
                <RulesPolicy />
                <h2>{t("cancellation")}</h2>
                <CancellationSummary />
              </>
            )}
          </div>
          {!cmsText ? (
            <Notice tone="warning" className="mt-6">
              {t("draftNotice")}
            </Notice>
          ) : null}
        </div>
      </Section>
    </>
  );
}
