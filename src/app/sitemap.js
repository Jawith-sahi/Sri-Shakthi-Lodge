import { routing } from "@/i18n/routing";
import { loadAttractions } from "@/lib/content";
import { getRooms } from "@/lib/api/rooms.api";
import { absoluteUrl } from "@/lib/seo/metadata";
import { safely } from "@/lib/api/client";

// Public, indexable pages only. Admin, booking success/cancelled/lookup are deliberately excluded.
const STATIC_PATHS = ["", "/about", "/rooms", "/offers", "/gallery", "/attractions", "/reviews", "/contact", "/policies", "/cancellation-policy", "/terms-and-conditions", "/privacy-policy", "/booking"];

export const revalidate = 3600;

export default async function sitemap() {
  const entries = [];
  const add = (path) => {
    const languages = Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(`/${l}${path}`)]));
    routing.locales.forEach((l) => entries.push({ url: absoluteUrl(`/${l}${path}`), alternates: { languages } }));
  };

  STATIC_PATHS.forEach(add);

  const rooms = await safely(getRooms(), []);
  (Array.isArray(rooms) ? rooms : rooms?.items || []).forEach((r) => r?.slug && add(`/rooms/${r.slug}`));

  const attractions = await safely(loadAttractions("en"), []);
  (Array.isArray(attractions) ? attractions : []).forEach((a) => a?.slug && add(`/attractions/${a.slug}`));

  return entries;
}
