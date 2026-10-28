import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { ADMIN_HINT_COOKIE } from "@/constants/auth";

// Next.js 16 "proxy" (formerly middleware).
//  - Public pages: locale negotiation / prefixing via next-intl.
//  - /admin/*: UX-only gate (redirect to login when the hint cookie is missing) + noindex header.
//    The .NET backend is what really enforces authentication and authorisation.

const handleIntl = createIntlMiddleware(routing);

export default function proxy(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const isLogin = pathname === "/admin/login";
    const hasHint = Boolean(request.cookies.get(ADMIN_HINT_COOKIE)?.value);

    let response;
    if (pathname === "/admin") {
      response = NextResponse.redirect(new URL(hasHint ? "/admin/dashboard" : "/admin/login", request.url));
    } else if (!isLogin && !hasHint) {
      const url = new URL("/admin/login", request.url);
      url.searchParams.set("next", pathname);
      response = NextResponse.redirect(url);
    } else {
      response = NextResponse.next();
    }
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  return handleIntl(request);
}

export const config = {
  // Everything except API routes, Next internals and files with an extension (sitemap.xml, robots.txt, images…)
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
