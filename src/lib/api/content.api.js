import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getMock, mutateAndRevalidate, publicGet, isMockApi } from "@/lib/api/helpers";
import { CACHE_TAGS } from "@/lib/api/revalidate";

/**
 * Public CMS content. Every field is optional; pages fall back to src/config/lodge.js + translations.
 * Shape (see README): { about, aboutImageUrl, heroImageUrl, announcement:{active,text}, faq:[{q,a}],
 *   contact:{...}, policies:{cancellation,terms,privacy}, seo:{...} } - localised fields are { en, ta }.
 */
export async function getContent() {
  if (isMockApi()) return (await getMock()).content.get();
  return (await publicGet(endpoints.content.get, CACHE_TAGS.content)) || {};
}

export async function adminGetContent() {
  if (isMockApi()) return (await getMock()).content.admin.get();
  return apiRequest(endpoints.content.admin.get);
}

export async function adminSaveContent(data) {
  if (isMockApi()) return (await getMock()).content.admin.update(data);
  return apiRequest(endpoints.content.admin.update, { method: "PUT", body: data });
}

/** Publishes the saved content and purges the public cache so the site updates immediately. */
export function adminPublishContent() {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).content.admin.publish();
    return apiRequest(endpoints.content.admin.publish, { method: "POST" });
  }, [CACHE_TAGS.content, CACHE_TAGS.rooms, CACHE_TAGS.offers]);
}
