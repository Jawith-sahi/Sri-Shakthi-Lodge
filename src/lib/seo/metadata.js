import { env } from "@/config/environment";
import { lodge } from "@/config/lodge";
import { LOCALE_LABELS } from "@/constants/locales";
import { routing } from "@/i18n/routing";

/** Absolute URL for a locale + path (path like "/rooms/single-bed"; "/" for the home page). */
export function absoluteUrl(locale, path = "/") {
  const clean = path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `${env.siteUrl}/${locale}${clean}`;
}

/** hreflang map for every supported locale (+ x-default = default locale). */
export function languageAlternates(path = "/") {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(l, path)]));
  languages["x-default"] = absoluteUrl(routing.defaultLocale, path);
  return languages;
}

/**
 * Builds the Next.js Metadata object used by every public page's generateMetadata().
 * @param {{locale:string, path?:string, title:string, description?:string, image?:string, noindex?:boolean, type?:string}} args
 */
export function buildMetadata({ locale, path = "/", title, description, image, noindex = false, type = "website" }) {
  const url = absoluteUrl(locale, path);
  const plainTitle = typeof title === "string" ? title : title?.absolute || title?.default || lodge.name;
  const ogImage = image || "/og-default.jpg";
  const images = [{ url: ogImage.startsWith("http") ? ogImage : `${env.siteUrl}${ogImage}` }];
  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      title: plainTitle,
      description,
      url,
      siteName: lodge.name,
      locale: LOCALE_LABELS[locale]?.ogLocale || "en_IN",
      type,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: plainTitle,
      description,
      images: images.map((i) => i.url),
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {}),
  };
}
