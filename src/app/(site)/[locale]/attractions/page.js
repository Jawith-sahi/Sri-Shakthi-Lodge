import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AttractionCard } from "@/components/home/AttractionCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadAttractions } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.attractions" });
  return buildMetadata({ locale, path: "/attractions", title: t("title"), description: t("description") });
}

export default async function AttractionsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tNav] = await Promise.all([getTranslations("attractions"), getTranslations("nav")]);
  const { items } = await loadAttractions(locale);

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: tNav("home"), path: "/" }, { name: tNav("attractions"), path: "/attractions" }])} />
      <PageHeader title={t("heading")} subtitle={t("intro")} />
      <Breadcrumbs items={[{ name: tNav("home"), href: "/" }, { name: tNav("attractions") }]} />
      <Section>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <li key={a.id}>
              <AttractionCard attraction={a} />
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
