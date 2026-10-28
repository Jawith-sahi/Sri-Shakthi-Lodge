import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { TextBlocks } from "@/components/policies/PolicyParts";
import { Notice } from "@/components/ui/States";
import { loadContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { pick } from "@/lib/utils/localize";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.privacy" });
  return buildMetadata({ locale, path: "/privacy-policy", title: t("title"), description: t("description") });
}

export default async function PrivacyPolicyPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tNav, tp, content] = await Promise.all([
    getTranslations("policies.privacyPage"),
    getTranslations("nav"),
    getTranslations("policies"),
    loadContent(),
  ]);
  const cmsText = pick(content.policies?.privacy, locale);

  return (
    <>
      <PageHeader title={t("heading")} />
      <Breadcrumbs items={[{ name: tNav("home"), href: "/" }, { name: tp("heading"), href: "/policies" }, { name: t("heading") }]} />
      <Section>
        <div className="mx-auto max-w-3xl">
          {!cmsText ? (
            <Notice tone="warning" className="mb-6">
              {t("draftNotice")}
            </Notice>
          ) : null}
          <div className="prose-policy">
            {cmsText ? (
              <TextBlocks text={cmsText} />
            ) : (
              <>
                <h2>{t("collectTitle")}</h2>
                <p>{t("collectIntro")}</p>
                <ul>
                  {["collect1", "collect2", "collect3", "collect4", "collect5", "collect6"].map((key) => (
                    <li key={key}>{t(key)}</li>
                  ))}
                </ul>
                <h2>{t("useTitle")}</h2>
                <p>{t("useText")}</p>
                <h2>{t("shareTitle")}</h2>
                <p>{t("shareText")}</p>
                <h2>{t("idTitle")}</h2>
                <p>{t("idText")}</p>
                <h2>{t("choicesTitle")}</h2>
                <p>{t("choicesText")}</p>
              </>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
