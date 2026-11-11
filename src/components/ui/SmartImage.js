import Image from "next/image";
import { env } from "@/config/environment";

function hostAllowed(src) {
  try {
    const host = new URL(src).hostname;
    const allowed = [...env.imageHosts];
    if (env.apiBaseUrl) allowed.push(new URL(env.apiBaseUrl).hostname);
    return allowed.some((h) => h === host || h === new URL(`https://${h.replace(/^https?:\/\//, "")}`).hostname);
  } catch {
    return false;
  }
}

/**
 * next/image wrapper that never crashes on an unexpected image source:
 *  - SVG placeholders, data/blob URLs and hosts that are not allow-listed are served as-is (unoptimized)
 *  - everything else is optimised by Next (AVIF/WebP, responsive sizes, lazy loading)
 * Always pass dimensions or `fill` (+ a relatively positioned parent) so layout never shifts.
 */
export function SmartImage({ src, alt = "", priority = false, sizes, ...props }) {
  let source = src || "/placeholders/room.svg";
  
  // If the path is a backend upload, ensure it targets the API base URL
  if (typeof source === "string" && source.startsWith("/uploads/") && env.apiBaseUrl) {
    source = `${env.apiBaseUrl}${source}`;
  }

  const isAbsolute = typeof source === "string" && /^https?:\/\//i.test(source);
  const isUpload = typeof source === "string" && source.includes("/uploads/");

  const unoptimized =
    source.endsWith(".svg") ||
    source.startsWith("data:") ||
    source.startsWith("blob:") ||
    isUpload ||
    (isAbsolute && !hostAllowed(source));

  return (
    <Image
      src={source}
      alt={alt}
      priority={priority}
      sizes={sizes}
      unoptimized={unoptimized}
      {...props}
    />
  );
}
