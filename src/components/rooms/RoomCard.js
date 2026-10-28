import { useLocale, useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AmenityList } from "@/components/rooms/AmenityList";
import { formatINR } from "@/lib/utils/format";
import { pick } from "@/lib/utils/localize";

/** Public price rule: show a price only when the API supplied a real positive number. */
export function getDisplayPrice(room, locale) {
  const n = Number(room?.startingPrice);
  return Number.isFinite(n) && n > 0 ? formatINR(n, locale) : null;
}

export function RoomCard({ room, priority = false }) {
  const t = useTranslations("rooms");
  const tc = useTranslations("common");
  const locale = useLocale();

  const name = pick(room.name, locale);
  const description = pick(room.shortDescription, locale);
  const price = getDisplayPrice(room, locale);
  const cover = room.images?.[0];

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-pop)]">
      <div className="relative aspect-[4/3] bg-surface">
        <SmartImage
          src={cover?.url}
          alt={pick(cover?.alt, locale) || name}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 352px, (min-width: 640px) 45vw, 100vw"
          className="object-cover"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge tone={room.isAc ? "blue" : "gray"} className="bg-white/95">
            {room.isAc ? tc("ac") : tc("nonAc")}
          </StatusBadge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-lg font-semibold text-primary-900">{name}</h3>
        {description ? <p className="mt-1.5 line-clamp-2 text-sm text-muted">{description}</p> : null}

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink">
          {room.maxOccupancy ? (
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary-500" aria-hidden="true" />
              {tc("upTo", { count: Number(room.maxOccupancy) })}
            </span>
          ) : null}
        </div>

        <AmenityList amenities={room.amenities} limit={3} inline className="mt-3" />

        <div className="mt-auto pt-4">
          <p className="mb-3 text-sm">
            {price ? (
              <>
                <span className="text-muted">{tc("from")} </span>
                <span className="text-xl font-bold text-primary-900">{price}</span>
                <span className="text-muted"> / {tc("perNight")}</span>
              </>
            ) : (
              <span className="font-medium text-primary-700">{tc("contactForRates")}</span>
            )}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <LinkButton href={`/rooms/${room.slug}`} variant="outline" size="md">
              {tc("viewDetails")}
            </LinkButton>
            <LinkButton href={`/booking?room=${encodeURIComponent(room.slug)}`} variant="accent" size="md">
              {tc("checkAvailability")}
            </LinkButton>
          </div>
        </div>
      </div>
    </article>
  );
}
