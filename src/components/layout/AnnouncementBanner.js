import { Megaphone } from "lucide-react";
import { pick } from "@/lib/utils/localize";

/** Optional site-wide notice edited in Admin > Content. Rendered as plain text (never HTML). */
export function AnnouncementBanner({ announcement, locale }) {
  if (!announcement?.active) return null;
  const text = pick(announcement.text, locale);
  if (!text) return null;
  return (
    <div role="status" className="bg-accent-100 text-primary-950 print:hidden">
      <p className="container-page flex items-center gap-2 py-2 text-sm font-medium">
        <Megaphone className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span>{text}</span>
      </p>
    </div>
  );
}
