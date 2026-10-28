import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ContactForm } from "@/components/contact/ContactForm";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { FaqList } from "@/components/home/FaqList";
import { JsonLd } from "@/components/seo/JsonLd";
import { loadContent, loadFaq } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqJsonLd, lodgingBusinessJsonLd } from "@/lib/seo/jsonld";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.contact" });
  return buildMetadata({ locale, path: "/contact", title: t("title"), description: t("description") });
}

export default async function ContactPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tNav, tHome, content] = await Promise.all([
    getTranslations("contact"),
    getTranslations("nav"),
    getTranslations("home"),
    loadContent(),
  ]);
  const faq = await loadFaq(locale, content);
  const description = (await getTranslations({ locale, namespace: "meta.contact" }))("description");

  return (
    <>
      <JsonLd data={[lodgingBusinessJsonLd({ locale, description, image: "/og-default.jpg" }), faqJsonLd(faq)]} />
      <PageHeader title={t("heading")} subtitle={t("intro")} />
      <Breadcrumbs items={[{ name: tNav("home"), href: "/" }, { name: tNav("contact") }]} />

      <Section>
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-2xl font-bold text-primary-900">{t("findUs")}</h2>
            <ContactInfo />
          </div>
          <div className="rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
            <h2 className="mb-5 text-2xl font-bold text-primary-900">{t("formTitle")}</h2>
            <ContactForm />
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-2xl font-bold text-primary-900">{tHome("faqTitle")}</h2>
          <FaqList items={faq} />
        </div>
      </Section>
    </>
  );
}
