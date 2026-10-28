import { env } from "@/config/environment";
import { REVALIDATE_ROUTE } from "@/lib/api/endpoints";

// Cache tags used for PUBLIC data. Admin saves call revalidatePublic([...]) so changes show up
// on the website straight away, without a developer or a redeploy.
export const CACHE_TAGS = {
  rooms: "rooms",
  offers: "offers",
  gallery: "gallery",
  attractions: "attractions",
  reviews: "reviews",
  content: "content",
};

export const PUBLIC_REVALIDATE_SECONDS = 300;

/** Browser-side helper. Failure never blocks the admin's save (cache simply expires on its own). */
export async function revalidatePublic(tags) {
  if (typeof window === "undefined") return;
  try {
    await fetch(REVALIDATE_ROUTE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tags }),
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    /* ignore - revalidation is best-effort */
  }
}

export const isMock = env.useMock;
