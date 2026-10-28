import { apiRequest, toPaged } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { asArray, getMock, mutateAndRevalidate, publicGet, isMockApi } from "@/lib/api/helpers";
import { CACHE_TAGS } from "@/lib/api/revalidate";

const TAGS = [CACHE_TAGS.offers];

/** Published offers that are currently valid (the backend filters; the UI filters again defensively). */
export async function getOffers() {
  const items = isMockApi()
    ? await (await getMock()).offers.publicList()
    : asArray(await publicGet(endpoints.offers.list, CACHE_TAGS.offers));
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  return items.filter(
    (o) => o.isPublished !== false && (!o.startDate || o.startDate <= today) && (!o.endDate || o.endDate >= today)
  );
}

export async function adminListOffers(params = {}) {
  if (isMockApi()) return (await getMock()).offers.admin.list(params);
  return toPaged(await apiRequest(endpoints.offers.admin.list, { query: params }), params);
}

export function adminCreateOffer(data) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).offers.admin.create(data);
    return apiRequest(endpoints.offers.admin.create, { method: "POST", body: data });
  }, TAGS);
}

export function adminUpdateOffer(id, data) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).offers.admin.update(id, data);
    return apiRequest(endpoints.offers.admin.update(id), { method: "PUT", body: data });
  }, TAGS);
}

export function adminDeleteOffer(id) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).offers.admin.remove(id);
    return apiRequest(endpoints.offers.admin.remove(id), { method: "DELETE" });
  }, TAGS);
}
