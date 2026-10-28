import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { TextBlocks } from "@/components/policies/PolicyParts";
import { LinkButton } from "@/components/ui/Button";
import { Notice } from "@/components/ui/States";
import { loadContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { pick } from "@/lib/utils/localize";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.cancellation" });
  return buildMetadata({ locale, path: "/cancellation-policy", title: t("title"), description: t("description") });
}

export default async function CancellationPolicyPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tNav, tp, content] = await Promise.all([
    getTranslations("policies.cancellationPage"),
    getTranslations("nav"),
    getTranslations("policies"),
    loadContent(),
  ]);
  const cmsText = pick(content.policies?.cancellation, locale);

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
                <h2>{t("how")}</h2>
                <p>{t("howText")}</p>
                <h2>{t("refunds")}</h2>
                <p>{t("refundsText")}</p>
              </>
            )}
          </div>
          {!cmsText ? (
            <Notice tone="warning" title={t("pendingTitle")} className="mt-6">
              {t("pendingText")}
            </Notice>
          ) : null}
          <LinkButton href="/booking/lookup" className="mt-8">
            {t("findBooking")}
          </LinkButton>
        </div>
      </Section>
    </>
  );
}
