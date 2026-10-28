import { getLocale, getTranslations } from "next-intl/server";
import { Car, Check, Coffee, Snowflake, Wifi } from "lucide-react";
import { lodge } from "@/config/lodge";
import { pick } from "@/lib/utils/localize";

const ICONS = { Wifi, Car, Coffee, Snowflake };

/** Facilities from the CMS if the lodge has entered any, otherwise the client-confirmed list in lodge.js. */
export async function AmenitiesGrid({ cmsAmenities }) {
  const t = await getTranslations("amenities");
  const locale = await getLocale();

  const items = cmsAmenities?.length
    ? cmsAmenities.map((a, i) => ({
        id: a.key || `cms-${i}`,
        title: pick(a.label, locale) || (a.key && t.has(a.key) ? t(a.key) : ""),
        description: pick(a.description, locale),
        Icon: ICONS[a.icon] || Check,
      })).filter((a) => a.title)
    : lodge.amenities.map((a) => ({
        id: a.key,
        title: t(a.key),
        description: t.has(`${a.key}Desc`) ? t(`${a.key}Desc`) : "",
        Icon: ICONS[a.icon] || Check,
      }));

  if (!items.length) return null;

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ id, title, description, Icon }) => (
        <li key={id} className="flex gap-4 rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-card)]">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-primary-900">{title}</h3>
            {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
