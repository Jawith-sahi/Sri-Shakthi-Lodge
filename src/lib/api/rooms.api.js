import { apiRequest, toPaged } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { asArray, getMock, mutateAndRevalidate, publicGet, isMockApi } from "@/lib/api/helpers";
import { CACHE_TAGS } from "@/lib/api/revalidate";

const TAGS = [CACHE_TAGS.rooms];

// ---------------- public ----------------

/** Public room categories (cached + revalidated by tag "rooms"). */
export async function getRooms() {
  if (isMockApi()) return (await getMock()).rooms.list();
  return asArray(await publicGet(endpoints.rooms.list, CACHE_TAGS.rooms));
}

/** Throws ApiError(code "not_found") when the room does not exist. */
export async function getRoom(slug) {
  if (isMockApi()) return (await getMock()).rooms.detail(slug);
  return publicGet(endpoints.rooms.detail(slug), CACHE_TAGS.rooms);
}

/**
 * Live availability + prices. NEVER cached: the browser must not decide availability or price.
 * @param {{checkIn:string, checkOut:string, adults:number, children?:number, rooms?:number, category?:string}} params
 */
export async function searchAvailability(params, { signal } = {}) {
  if (isMockApi()) return (await getMock()).rooms.availability(params);
  return apiRequest(endpoints.rooms.availability, { query: params, auth: false, signal });
}

// ---------------- admin ----------------

export async function adminListRooms(params = {}) {
  if (isMockApi()) return (await getMock()).rooms.admin.list(params);
  return toPaged(await apiRequest(endpoints.rooms.admin.list, { query: params }), params);
}

export async function adminGetRoom(id) {
  if (isMockApi()) return (await getMock()).rooms.admin.detail(id);
  return apiRequest(endpoints.rooms.admin.detail(id));
}

export function createRoom(data) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).rooms.admin.create(data);
    return apiRequest(endpoints.rooms.admin.create, { method: "POST", body: data });
  }, TAGS);
}

export function updateRoom(id, data) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).rooms.admin.update(id, data);
    return apiRequest(endpoints.rooms.admin.update(id), { method: "PUT", body: data });
  }, TAGS);
}

export function setRoomActive(id, isActive) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).rooms.admin.setActive(id, isActive);
    return apiRequest(endpoints.rooms.admin.setActive(id), { method: "PATCH", body: { isActive } });
  }, TAGS);
}

/** The backend decides whether deleting is allowed (e.g. rooms with bookings are refused). */
export function deleteRoom(id) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).rooms.admin.remove(id);
    return apiRequest(endpoints.rooms.admin.remove(id), { method: "DELETE" });
  }, TAGS);
}

export function uploadRoomImage(id, file) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).rooms.admin.uploadImage(id, file);
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest(endpoints.rooms.admin.images(id), { method: "POST", formData, timeout: 60000 });
  }, TAGS);
}

export function deleteRoomImage(id, imageId) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).rooms.admin.deleteImage(id, imageId);
    return apiRequest(endpoints.rooms.admin.image(id, imageId), { method: "DELETE" });
  }, TAGS);
}

export function reorderRoomImages(id, imageIds) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).rooms.admin.reorderImages(id, imageIds);
    return apiRequest(endpoints.rooms.admin.reorderImages(id), { method: "PUT", body: { imageIds } });
  }, TAGS);
}

export async function listBlockedDates(id) {
  if (isMockApi()) return (await getMock()).rooms.admin.blockedDates(id);
  return asArray(await apiRequest(endpoints.rooms.admin.blockedDates(id)));
}

export async function addBlockedDate(id, data) {
  if (isMockApi()) return (await getMock()).rooms.admin.addBlockedDate(id, data);
  return apiRequest(endpoints.rooms.admin.blockedDates(id), { method: "POST", body: data });
}

export async function removeBlockedDate(id, blockId) {
  if (isMockApi()) return (await getMock()).rooms.admin.removeBlockedDate(id, blockId);
  return apiRequest(endpoints.rooms.admin.blockedDate(id, blockId), { method: "DELETE" });
}
