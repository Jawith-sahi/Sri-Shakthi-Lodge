import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { AmenitiesGrid } from "@/components/home/AmenitiesGrid";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { SmartImage } from "@/components/ui/SmartImage";
import { LinkButton } from "@/components/ui/Button";
import { loadContent } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { pick } from "@/lib/utils/localize";
import { lodge } from "@/config/lodge";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.about" });
  return buildMetadata({ locale, path: "/about", title: t("title"), description: t("description") });
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tHome, tNav, tRooms, content] = await Promise.all([
    getTranslations("about"),
    getTranslations("home"),
    getTranslations("nav"),
    getTranslations("rooms"),
    loadContent(),
  ]);
  const body = pick(content.about, locale) || t("defaultBody");

  return (
    <>
      <PageHeader title={t("heading")} subtitle={lodge.name} />
      <Breadcrumbs label="Breadcrumb" items={[{ name: tNav("home"), href: "/" }, { name: tNav("about") }]} />

      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4 text-lg leading-relaxed text-ink">
            {body.split(/\n\s*\n/).map((para, i) => (
              <p key={i}>{para}</p>
            ))}
            <div className="pt-4">
              <h2 className="mb-2 text-xl font-bold text-primary-900">{t("roomTypesTitle")}</h2>
              <p className="text-base text-muted">{t("roomTypesBody")}</p>
              <LinkButton href="/rooms" variant="outline" className="mt-4">
                {tRooms("allRooms")}
              </LinkButton>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-surface shadow-[var(--shadow-card)]">
            <SmartImage src={content.aboutImageUrl || "/placeholders/about.svg"} alt="" fill priority sizes="(min-width: 1024px) 440px, 100vw" className="object-cover" />
          </div>
        </div>
      </Section>

      <Section tone="muted">
        <h2 className="mb-8 text-2xl font-bold text-primary-900">{tHome("amenitiesTitle")}</h2>
        <AmenitiesGrid cmsAmenities={content.amenities} />
      </Section>

      <Section>
        <h2 className="mb-2 text-2xl font-bold text-primary-900">{t("helpTitle")}</h2>
        <p className="mb-8 text-muted">{t("helpBody")}</p>
        <div className="max-w-2xl">
          <ContactInfo />
        </div>
      </Section>
    </>
  );
  
}
