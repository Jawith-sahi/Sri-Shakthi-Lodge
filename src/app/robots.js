import { absoluteUrl } from "@/lib/seo/metadata";

export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/en/booking/success", "/ta/booking/success", "/en/booking/cancelled", "/ta/booking/cancelled", "/en/booking/lookup", "/ta/booking/lookup"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
