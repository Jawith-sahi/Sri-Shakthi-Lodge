import { useLocale, useTranslations } from "next-intl";
import { MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SmartImage } from "@/components/ui/SmartImage";
import { getValidMapsUrl } from "@/config/lodge";
import { pick } from "@/lib/utils/localize";

export function AttractionCard({ attraction }) {
  const t = useTranslations("attractions");
  const locale = useLocale();
  const name = pick(attraction.name, locale);
  const description = pick(attraction.description, locale);
  const category = attraction.category && t.has(`categories.${attraction.category}`) ? t(`categories.${attraction.category}`) : null;
  const mapsUrl = getValidMapsUrl(attraction.mapsUrl);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)]">
      <div className="relative aspect-[16/10] bg-surface">
        <SmartImage
          src={attraction.imageUrl || "/placeholders/attraction.svg"}
          alt=""
          fill
          sizes="(min-width: 1024px) 352px, (min-width: 640px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {category ? <p className="text-xs font-semibold uppercase tracking-wide text-accent-700">{category}</p> : null}
        <h3 className="mt-1 text-lg font-semibold text-primary-900">
          <Link href={`/attractions/${attraction.slug}`} className="after:absolute after:inset-0 relative hover:underline">
            {name}
          </Link>
        </h3>
        {description ? <p className="mt-2 line-clamp-3 text-sm text-muted">{description}</p> : null}
        {mapsUrl ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-primary hover:underline"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" /> {t("viewOnMap")}
          </a>
        ) : null}
      </div>
    </article>
  );
}
