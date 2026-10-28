import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Phone, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Section } from "@/components/common/Section";
import { AvailabilityForm } from "@/components/booking/AvailabilityForm";
import { RoomCard, getDisplayPrice } from "@/components/rooms/RoomCard";
import { RoomGallery } from "@/components/rooms/RoomGallery";
import { AmenityList } from "@/components/rooms/AmenityList";
import { JsonLd } from "@/components/seo/JsonLd";
import { LinkButton } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getRoom, getRooms } from "@/lib/api/rooms.api";
import { settle } from "@/lib/api/client";
import { getPrimaryPhone } from "@/config/lodge";
import { breadcrumbJsonLd, hotelRoomJsonLd } from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";
import { pick } from "@/lib/utils/localize";

export async function generateStaticParams() {
  const { data } = await settle(getRooms());
  return (data || []).map((room) => ({ slug: room.slug }));
}

async function loadRoom(slug) {
  const { data, error } = await settle(getRoom(slug));
  if (data) return data;
  // Unknown room, or the backend is not connected: show the proper 404. Anything else is a real failure -> error page.
  if (!error || error.code === "not_found" || error.code === "not_configured") notFound();
  throw error;
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const { data: room } = await settle(getRoom(slug));
  if (!room) return buildMetadata({ locale, path: `/rooms/${slug}`, title: "Room", noindex: true });
  const t = await getTranslations({ locale, namespace: "meta.roomDetail" });
  const tc = await getTranslations({ locale, namespace: "common" });
  const name = pick(room.name, locale);
  return buildMetadata({
    locale,
    path: `/rooms/${slug}`,
    title: `${name} – ${room.isAc ? tc("ac") : tc("nonAc")}`,
    description: pick(room.shortDescription, locale) || t("description", { name }),
    image: room.images?.[0]?.url,
  });
}

export default async function RoomDetailPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const room = await loadRoom(slug);
  const [t, tc, tNav] = await Promise.all([
    getTranslations("rooms"),
    getTranslations("common"),
    getTranslations("nav"),
  ]);
  const { data: allRooms } = await settle(getRooms());

  const name = pick(room.name, locale);
  const description = pick(room.description, locale) || pick(room.shortDescription, locale);
  const price = getDisplayPrice(room, locale);
  const phone = getPrimaryPhone();
  const related = (allRooms || [])
    .filter((r) => r.slug !== room.slug)
    .sort((a, b) => Number(b.isAc === room.isAc) - Number(a.isAc === room.isAc))
    .slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          hotelRoomJsonLd({ locale, room }),
          breadcrumbJsonLd(locale, [
            { name: tNav("home"), path: "/" },
            { name: tNav("rooms"), path: "/rooms" },
            { name, path: `/rooms/${room.slug}` },
          ]),
        ]}
      />
      <Breadcrumbs items={[{ name: tNav("home"), href: "/" }, { name: tNav("rooms"), href: "/rooms" }, { name }]} />

      <Section className="!pt-6">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <RoomGallery images={room.images} name={name} />

            <div className="mt-8">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-primary-900">{name}</h1>
                <StatusBadge tone={room.isAc ? "blue" : "gray"}>{room.isAc ? tc("ac") : tc("nonAc")}</StatusBadge>
              </div>
              {room.maxOccupancy ? (
                <p className="mt-3 inline-flex items-center gap-2 text-ink">
                  <Users className="h-5 w-5 text-primary-500" aria-hidden="true" />
                  {t("occupancy", { count: Number(room.maxOccupancy) })}
                </p>
              ) : null}

              {description ? (
                <div className="mt-6">
                  <h2 className="mb-2 text-xl font-bold text-primary-900">{t("about")}</h2>
                  <div className="space-y-3 leading-relaxed text-ink">
                    {description.split(/\n\s*\n/).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>
              ) : null}

              {room.amenities?.length ? (
                <div className="mt-6">
                  <h2 className="mb-3 text-xl font-bold text-primary-900">{t("facilities")}</h2>
                  <AmenityList amenities={room.amenities} />
                </div>
              ) : null}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start" aria-label={t("rates")}>
            <div className="rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-card)] sm:p-6">
              <h2 className="text-lg font-semibold text-primary-900">{t("rates")}</h2>
              <p className="mt-2">
                {price ? (
                  <>
                    <span className="text-sm text-muted">{tc("from")} </span>
                    <span className="text-3xl font-bold text-primary-900">{price}</span>
                    <span className="text-sm text-muted"> / {tc("perNight")}</span>
                  </>
                ) : (
                  <span className="font-medium text-primary-700">{tc("contactForRates")}</span>
                )}
              </p>
              <p className="mt-1 text-sm text-muted">{t("ratesNote")}</p>
              <div className="mt-5 border-t border-line pt-5">
                <AvailabilityForm roomSlug={room.slug} category={room.isAc ? "ac" : "non-ac"} compact />
              </div>
              {phone ? (
                <LinkButton external href={`tel:${phone.tel}`} variant="outline" fullWidth className="mt-3">
                  <Phone className="h-4 w-4" aria-hidden="true" /> {tNav("callNow")} · {phone.display}
                </LinkButton>
              ) : null}
            </div>
          </aside>
        </div>
      </Section>

      {related.length ? (
        <Section tone="muted">
          <h2 className="mb-8 text-2xl font-bold text-primary-900">{t("related")}</h2>
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <li key={r.id || r.slug}>
                <RoomCard room={r} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}
