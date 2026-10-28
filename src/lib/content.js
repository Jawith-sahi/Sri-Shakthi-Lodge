// Server-side helpers that merge CMS/API content with the translated defaults.
import { getTranslations } from "next-intl/server";
import { lodge } from "@/config/lodge";
import { settle } from "@/lib/api/client";
import { getAttractions } from "@/lib/api/attractions.api";
import { getContent } from "@/lib/api/content.api";
import { pick } from "@/lib/utils/localize";

/** Attractions from the API, or the (name-only) defaults from lodge.js while nothing is published. */
export async function loadAttractions(locale) {
  const { data, error } = await settle(getAttractions());
  if (data?.length) return { items: data, fromApi: true, error: null };

  const t = await getTranslations({ locale, namespace: "attractions.defaults" });
  const items = lodge.defaultAttractions.map((a, i) => ({
    id: a.slug,
    slug: a.slug,
    name: t(`${a.key}.name`),
    description: t(`${a.key}.description`),
    category: a.category,
    imageUrl: "/placeholders/attraction.svg",
    mapsUrl: "",
    order: i,
    isDefault: true,
  }));
  return { items, fromApi: false, error };
}

/** FAQ: CMS entries when present, otherwise the confirmed facts from the translation files. */
export async function loadFaq(locale, content) {
  const fromCms = (content?.faq || [])
    .map((f, i) => ({ id: f.id || `cms-${i}`, question: pick(f.q, locale), answer: pick(f.a, locale) }))
    .filter((f) => f.question && f.answer);
  if (fromCms.length) return fromCms;

  const t = await getTranslations({ locale, namespace: "faq.items" });
  return ["checkIn", "parking", "wifi", "payment", "lateCheckout", "extension", "cancel", "liquor"].map((key) => ({
    id: key,
    question: t(`${key}.q`),
    answer: t(`${key}.a`),
  }));
}

export async function loadContent() {
  const { data } = await settle(getContent());
  return data || {};
}
