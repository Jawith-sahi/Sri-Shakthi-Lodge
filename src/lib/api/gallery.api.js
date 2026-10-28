import { apiRequest, toPaged } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { asArray, getMock, mutateAndRevalidate, publicGet, isMockApi } from "@/lib/api/helpers";
import { CACHE_TAGS } from "@/lib/api/revalidate";

const TAGS = [CACHE_TAGS.gallery];

export async function getGallery() {
  const items = isMockApi()
    ? await (await getMock()).gallery.publicList()
    : asArray(await publicGet(endpoints.gallery.list, CACHE_TAGS.gallery));
  return items.filter((g) => g.isPublished !== false).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export async function adminListGallery(params = {}) {
  if (isMockApi()) return (await getMock()).gallery.admin.list(params);
  return toPaged(await apiRequest(endpoints.gallery.admin.list, { query: params }), params);
}

export function adminCreateGalleryItem(data) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).gallery.admin.create(data);
    return apiRequest(endpoints.gallery.admin.create, { method: "POST", body: data });
  }, TAGS);
}

export function adminUpdateGalleryItem(id, data) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).gallery.admin.update(id, data);
    return apiRequest(endpoints.gallery.admin.update(id), { method: "PUT", body: data });
  }, TAGS);
}

export function adminDeleteGalleryItem(id) {
  return mutateAndRevalidate(async () => {
    if (isMockApi()) return (await getMock()).gallery.admin.remove(id);
    return apiRequest(endpoints.gallery.admin.remove(id), { method: "DELETE" });
  }, TAGS);
}

/**
 * Generic image upload used by offers / gallery / attractions / content forms.
 * @returns {Promise<{url:string}>} the stored image URL to save on the record.
 */
export async function uploadImage(file) {
  if (isMockApi()) return (await getMock()).upload.image(file);
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest(endpoints.gallery.admin.upload, { method: "POST", formData, timeout: 60000 });
}
