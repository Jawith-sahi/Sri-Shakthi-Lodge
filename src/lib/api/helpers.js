import { env } from "@/config/environment";
import { apiRequest } from "@/lib/api/client";
import { PUBLIC_REVALIDATE_SECONDS, revalidatePublic } from "@/lib/api/revalidate";

/** Mock adapter, loaded lazily (separate chunk, only ever fetched when NEXT_PUBLIC_USE_MOCK=true). */
export const getMock = () => import("@/lib/mock").then((m) => m.mock);

export const isMockApi = () => env.useMock;

/** Cached GET for PUBLIC content (rooms list, offers, gallery…). Never use for availability, bookings, guests or admin data. */
export function publicGet(path, tag, query) {
  return apiRequest(path, {
    auth: false,
    query,
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [tag],
  });
}

/** Run an admin write, then purge the matching public cache tags (best effort). */
export async function mutateAndRevalidate(run, tags) {
  const result = await run();
  if (tags?.length) await revalidatePublic(tags);
  return result;
}

export const asArray = (res) => (Array.isArray(res) ? res : res?.items ?? res?.data ?? []);
