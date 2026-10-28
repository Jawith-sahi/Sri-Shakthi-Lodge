import { apiRequest, toPaged } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getMock, isMockApi } from "@/lib/api/helpers";

// Staff management (owner only). The BACKEND enforces the owner role; the UI merely hides the screen.

export async function listStaff() {
  if (isMockApi()) return (await getMock()).staff.list();
  return toPaged(await apiRequest(endpoints.staff.list)).items;
}

export async function createStaff(data) {
  if (isMockApi()) return (await getMock()).staff.create(data);
  return apiRequest(endpoints.staff.create, { method: "POST", body: data });
}

export async function updateStaff(id, patch) {
  if (isMockApi()) return (await getMock()).staff.update(id, patch);
  return apiRequest(endpoints.staff.update(id), { method: "PATCH", body: patch });
}
