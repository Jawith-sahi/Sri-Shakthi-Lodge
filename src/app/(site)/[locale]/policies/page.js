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
} from "@/components/policies/PolicyParts";
import { Notice } from "@/components/ui/States";
import { Link } from "@/i18n/navigation";
import { POLICY_LINKS } from "@/constants/nav";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.policies" });
  return buildMetadata({ locale, path: "/policies", title: t("title"), description: t("description") });
}

export default async function PoliciesPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tNav, tFooter] = await Promise.all([getTranslations("policies"), getTranslations("nav"), getTranslations("footer")]);

  const sections = [
    { key: "checkIn", Body: CheckInOutPolicy },
    { key: "lateCheckout", Body: LateCheckoutPolicy },
    { key: "extension", Body: ExtensionPolicy },
    { key: "payments", Body: PaymentsPolicy },
    { key: "rules", Body: RulesPolicy },
    { key: "cancellation", Body: CancellationSummary },
  ];

  return (
    <>
      <PageHeader title={t("heading")} subtitle={t("intro")} />
      <Breadcrumbs items={[{ name: tNav("home"), href: "/" }, { name: t("heading") }]} />
      <Section>
        <div className="mx-auto max-w-3xl">
          <Notice tone="warning" title={t("draftTitle")} className="mb-8">
            {t("draftBody")}
          </Notice>
          <div className="prose-policy">
            {sections.map(({ key, Body }) => (
              <section key={key}>
                <h2>{t(`sections.${key}`)}</h2>
                <Body />
              </section>
            ))}
          </div>

          <h2 className="mb-3 mt-10 text-lg font-bold text-primary-900">{t("relatedTitle")}</h2>
          <ul className="flex flex-wrap gap-3">
            {POLICY_LINKS.filter((l) => l.key !== "policies").map((link) => (
              <li key={link.key}>
                <Link href={link.href} className="inline-flex min-h-11 items-center rounded-lg border border-line px-4 font-medium text-primary hover:bg-primary-50">
                  {tFooter(`policyLinks.${link.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
