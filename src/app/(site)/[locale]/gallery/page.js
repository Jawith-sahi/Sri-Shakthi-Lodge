import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { RetryButton } from "@/components/common/RetryButton";
import { GalleryExplorer } from "@/components/gallery/GalleryExplorer";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { getGallery } from "@/lib/api/gallery.api";
import { settle } from "@/lib/api/client";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.gallery" });
  return buildMetadata({ locale, path: "/gallery", title: t("title"), description: t("description") });
}

export default async function GalleryPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tNav, tErr] = await Promise.all([getTranslations("gallery"), getTranslations("nav"), getTranslations("errors")]);
  const { data: items, error } = await settle(getGallery());
  const failed = error && error.code !== "not_configured";

  return (
    <>
      <PageHeader title={t("heading")} />
      <Breadcrumbs items={[{ name: tNav("home"), href: "/" }, { name: tNav("gallery") }]} />
      <Section>
        {items?.length ? (
          <GalleryExplorer items={items} />
        ) : failed ? (
          <ErrorState title={tErr("pageTitle")} body={tErr("dataUnavailable")} action={<RetryButton />} />
        ) : (
          <EmptyState title={t("emptyTitle")} body={t("emptyBody")} action={<LinkButton href="/contact">{tNav("contact")}</LinkButton>} />
        )}
      </Section>
    </>
  );
}
