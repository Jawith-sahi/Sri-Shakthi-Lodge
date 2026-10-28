import { apiRequest, toPaged } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getMock, isMockApi } from "@/lib/api/helpers";

/** Public contact form. `website` is the honeypot field (must stay empty); `captchaToken` is optional. */
export async function submitEnquiry(data) {
  if (isMockApi()) return (await getMock()).enquiries.submit(data);
  return apiRequest(endpoints.enquiries.submit, { method: "POST", body: data, auth: false });
}

export async function adminListEnquiries(params = {}) {
  if (isMockApi()) return (await getMock()).enquiries.admin.list(params);
  return toPaged(await apiRequest(endpoints.enquiries.admin.list, { query: params }), params);
}

export async function adminGetEnquiry(id) {
  if (isMockApi()) return (await getMock()).enquiries.admin.detail(id);
  return apiRequest(endpoints.enquiries.admin.detail(id));
}

/** @param {{status?: "new"|"read"|"resolved", notes?: string}} patch */
export async function adminUpdateEnquiry(id, patch) {
  if (isMockApi()) return (await getMock()).enquiries.admin.update(id, patch);
  return apiRequest(endpoints.enquiries.admin.update(id), { method: "PATCH", body: patch });
}
