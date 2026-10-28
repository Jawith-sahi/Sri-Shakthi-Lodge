import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { ADMIN_HINT_COOKIE } from "@/constants/auth";
import { CACHE_TAGS } from "@/lib/api/revalidate";

// Purges cached PUBLIC pages after content changes, so edits show on the website without a developer or redeploy.
//
// Who may call it:
//   * the .NET backend, with header  x-revalidate-secret: <REVALIDATE_SECRET>   (recommended: call this after every public-content write)
//   * the admin UI in the browser (best effort; it carries the UX hint cookie)
// Purging a cache is low-risk and the tag list is a fixed allow-list, so nothing else can be touched.

const ALLOWED = new Set(Object.values(CACHE_TAGS));

export async function POST(request) {
  const secret = process.env.REVALIDATE_SECRET;
  const hasSecret = Boolean(secret) && request.headers.get("x-revalidate-secret") === secret;
  const hasAdminHint = Boolean(request.cookies.get(ADMIN_HINT_COOKIE)?.value);
  if (!hasSecret && !hasAdminHint) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    /* empty body = purge everything */
  }
  const requested = Array.isArray(body.tags) && body.tags.length ? body.tags : [...ALLOWED];
  const tags = requested.filter((t) => ALLOWED.has(t));

  for (const tag of tags) revalidateTag(tag, { expire: 0 });
  return NextResponse.json({ ok: true, revalidated: tags });
}
