import { useLocale, useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { pick } from "@/lib/utils/localize";
import { cn } from "@/lib/utils/cn";

/** Amenity label: text from the API if present, otherwise the translated label for a known key, otherwise the key itself. */
export function useAmenityLabel() {
  const t = useTranslations("amenities");
  const locale = useLocale();
  return (amenity) => {
    if (typeof amenity === "string") return t.has(amenity) ? t(amenity) : amenity;
    const fromApi = pick(amenity.label, locale);
    if (fromApi) return fromApi;
    return amenity.key && t.has(amenity.key) ? t(amenity.key) : amenity.key || "";
  };
}

export function AmenityList({ amenities = [], limit, className, inline = false }) {
  const label = useAmenityLabel();
  const items = (limit ? amenities.slice(0, limit) : amenities).map((a) => ({ a, text: label(a) })).filter((x) => x.text);
  if (!items.length) return null;

  if (inline) {
    return (
      <ul className={cn("flex flex-wrap gap-1.5", className)}>
        {items.map(({ a, text }, i) => (
          <li key={a.key || i} className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700">
            {text}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn("grid gap-2 sm:grid-cols-2", className)}>
      {items.map(({ a, text }, i) => (
        <li key={a.key || i} className="flex items-center gap-2 text-ink">
          <Check className="h-4 w-4 shrink-0 text-success-600" aria-hidden="true" />
          {text}
        </li>
      ))}
    </ul>
  );
}
