import { apiRequest, toPaged } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getMock, mutateAndRevalidate, isMockApi } from "@/lib/api/helpers";
import { CACHE_TAGS } from "@/lib/api/revalidate";

// The BACKEND is the pricing authority. Editing a tariff must never change already-confirmed bookings
// (the backend stores the price on each booking at confirmation time).
const TAGS = [CACHE_TAGS.rooms]; // starting prices on public room cards

export async function adminListTariffs(params = {}) {
  if (isMockApi()) return (await getMock()).tariffs.admin.list(params);
  return toPaged(await apiRequest(endpoints.tariffs.list, { query: params }), params);
}

export function adminCreateTariff(data) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).tariffs.admin.create(data);
    return apiRequest(endpoints.tariffs.create, { method: "POST", body: data });
  }, TAGS);
}

export function adminUpdateTariff(id, data) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).tariffs.admin.update(id, data);
    return apiRequest(endpoints.tariffs.update(id), { method: "PUT", body: data });
  }, TAGS);
}

export function adminDeleteTariff(id) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).tariffs.admin.remove(id);
    return apiRequest(endpoints.tariffs.remove(id), { method: "DELETE" });
  }, TAGS);
}
