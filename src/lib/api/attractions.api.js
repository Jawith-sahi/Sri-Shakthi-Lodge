import { apiRequest, toPaged } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { asArray, getMock, mutateAndRevalidate, publicGet, isMockApi } from "@/lib/api/helpers";
import { CACHE_TAGS } from "@/lib/api/revalidate";

const TAGS = [CACHE_TAGS.attractions];

export async function getAttractions() {
  const items = isMockApi()
    ? await (await getMock()).attractions.publicList()
    : asArray(await publicGet(endpoints.attractions.list, CACHE_TAGS.attractions));
  return items.filter((a) => a.isPublished !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Throws ApiError(code "not_found") when missing. */
export async function getAttraction(slug) {
  if (isMockApi()) return (await getMock()).attractions.detail(slug);
  return publicGet(endpoints.attractions.detail(slug), CACHE_TAGS.attractions);
}

export async function adminListAttractions(params = {}) {
  if (isMockApi()) return (await getMock()).attractions.admin.list(params);
  return toPaged(await apiRequest(endpoints.attractions.admin.list, { query: params }), params);
}

export function adminCreateAttraction(data) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).attractions.admin.create(data);
    return apiRequest(endpoints.attractions.admin.create, { method: "POST", body: data });
  }, TAGS);
}

export function adminUpdateAttraction(id, data) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).attractions.admin.update(id, data);
    return apiRequest(endpoints.attractions.admin.update(id), { method: "PUT", body: data });
  }, TAGS);
}

export function adminDeleteAttraction(id) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).attractions.admin.remove(id);
    return apiRequest(endpoints.attractions.admin.remove(id), { method: "DELETE" });
  }, TAGS);
}
