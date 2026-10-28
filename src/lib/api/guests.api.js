import { apiRequest, toPaged } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getMock, isMockApi } from "@/lib/api/helpers";

// Guest data is private: never cached, never exposed on public pages.
// The backend should return ID numbers masked (or not at all) - the UI never asks for the full number.

export async function adminListGuests(params = {}) {
  if (isMockApi()) return (await getMock()).guests.list(params);
  return toPaged(await apiRequest(endpoints.guests.list, { query: params }), params);
}

export async function adminGetGuest(id) {
  if (isMockApi()) return (await getMock()).guests.detail(id);
  return apiRequest(endpoints.guests.detail(id));
}
