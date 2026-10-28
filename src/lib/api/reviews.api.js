import { apiRequest, toPaged } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { asArray, getMock, mutateAndRevalidate, publicGet, isMockApi } from "@/lib/api/helpers";
import { CACHE_TAGS } from "@/lib/api/revalidate";

const TAGS = [CACHE_TAGS.reviews];

/** Approved reviews only. Returns [] when there are none (the section is then hidden). */
export async function getApprovedReviews() {
  const items = isMockApi()
    ? await (await getMock()).reviews.publicList()
    : asArray(await publicGet(endpoints.reviews.list, CACHE_TAGS.reviews));
  return items.filter((r) => !r.status || r.status === "approved");
}

/** Visitor-submitted review. It is saved as "pending" and only appears after an admin approves it. */
export async function submitReview(data) {
  if (isMockApi()) return (await getMock()).reviews.submit(data);
  return apiRequest(endpoints.reviews.submit, { method: "POST", body: data, auth: false });
}

export async function adminListReviews(params = {}) {
  if (isMockApi()) return (await getMock()).reviews.admin.list(params);
  return toPaged(await apiRequest(endpoints.reviews.admin.list, { query: params }), params);
}

/** @param {"approved"|"rejected"|"hidden"|"pending"} status */
export function adminModerateReview(id, status) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).reviews.admin.moderate(id, status);
    return apiRequest(endpoints.reviews.admin.moderate(id), { method: "PATCH", body: { status } });
  }, TAGS);
}
