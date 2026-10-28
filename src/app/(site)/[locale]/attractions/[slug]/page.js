import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Section } from "@/components/common/Section";
import { JsonLd } from "@/components/seo/JsonLd";
import { LinkButton } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { getAttraction } from "@/lib/api/attractions.api";
import { settle } from "@/lib/api/client";
import { loadAttractions } from "@/lib/content";
import { getValidMapsUrl } from "@/config/lodge";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { pick } from "@/lib/utils/localize";

export async function generateStaticParams() {
  const { items } = await loadAttractions("en");
  return items.map((a) => ({ slug: a.slug }));
}

// Published attraction from the API, or one of the name-only defaults while nothing is published yet.
async function loadAttraction(slug, locale) {
  const { data, error } = await settle(getAttraction(slug));
  if (data) return data;
  if (error && !["not_found", "not_configured"].includes(error.code)) throw error;
  const { items, fromApi } = await loadAttractions(locale);
  const fallback = !fromApi ? items.find((a) => a.slug === slug) : null;
  if (!fallback) notFound();
  return fallback;
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const { data } = await settle(getAttraction(slug));
  const fallback = data ? null : (await loadAttractions(locale)).items.find((a) => a.slug === slug);
  const item = data || fallback;
  if (!item) return buildMetadata({ locale, path: `/attractions/${slug}`, title: "Attraction", noindex: true });
  const t = await getTranslations({ locale, namespace: "meta.attractionDetail" });
  const name = pick(item.name, locale);
  return buildMetadata({
    locale,
    path: `/attractions/${slug}`,
    title: name,
    description: pick(item.description, locale)?.slice(0, 160) || t("description", { name }),
    image: item.imageUrl && !item.imageUrl.endsWith(".svg") ? item.imageUrl : undefined,
  });
}

export default async function AttractionDetailPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const item = await loadAttraction(slug, locale);
  const [t, tNav] = await Promise.all([getTranslations("attractions"), getTranslations("nav")]);

  const name = pick(item.name, locale);
  const description = pick(item.description, locale);
  const mapsUrl = getValidMapsUrl(item.mapsUrl);
  const category = item.category && t.has(`categories.${item.category}`) ? t(`categories.${item.category}`) : null;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd(locale, [
          { name: tNav("home"), path: "/" },
          { name: tNav("attractions"), path: "/attractions" },
          { name, path: `/attractions/${slug}` },
        ])}
      />
      <Breadcrumbs items={[{ name: tNav("home"), href: "/" }, { name: tNav("attractions"), href: "/attractions" }, { name }]} />
      <Section className="!pt-6">
        <div className="grid items-start gap-8 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-surface">
            <SmartImage src={item.imageUrl || "/placeholders/attraction.svg"} alt="" fill priority sizes="(min-width: 1024px) 560px, 100vw" className="object-cover" />
          </div>
          <div>
            {category ? <p className="text-sm font-semibold uppercase tracking-wide text-accent-700">{category}</p> : null}
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-primary-900">{name}</h1>
            {description ? (
              <div className="mt-5 space-y-3 text-lg leading-relaxed text-ink">
                <h2 className="sr-only">{t("about")}</h2>
                {description.split(/\n\s*\n/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              {mapsUrl ? (
                <LinkButton external href={mapsUrl} variant="outline">
                  <MapPin className="h-4 w-4" aria-hidden="true" /> {t("viewOnMap")}
                </LinkButton>
              ) : null}
              <LinkButton href="/booking" variant="accent">
                {tNav("bookNow")}
              </LinkButton>
              <LinkButton href="/attractions" variant="ghost">
                {t("allPlaces")}
              </LinkButton>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
