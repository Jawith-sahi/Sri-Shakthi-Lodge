import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/common/PageHeader";
import { Section } from "@/components/common/Section";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { RetryButton } from "@/components/common/RetryButton";
import { RoomsExplorer } from "@/components/rooms/RoomsExplorer";
import { JsonLd } from "@/components/seo/JsonLd";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { RoomCardSkeleton } from "@/components/ui/Skeleton";
import { getRooms } from "@/lib/api/rooms.api";
import { settle } from "@/lib/api/client";
import { buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.rooms" });
  return buildMetadata({ locale, path: "/rooms", title: t("title"), description: t("description") });
}

export default async function RoomsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tNav] = await Promise.all([getTranslations("rooms"), getTranslations("nav")]);
  const { data: rooms, error } = await settle(getRooms());

  const failed = error && error.code !== "not_configured";

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(locale, [{ name: tNav("home"), path: "/" }, { name: tNav("rooms"), path: "/rooms" }])} />
      <PageHeader title={t("heading")} subtitle={t("intro")} />
      <Breadcrumbs items={[{ name: tNav("home"), href: "/" }, { name: tNav("rooms") }]} />

      <Section>
        {rooms?.length ? (
          <Suspense
            fallback={
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <RoomCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <RoomsExplorer rooms={rooms} />
          </Suspense>
        ) : failed ? (
          <ErrorState
            title={t("errorTitle")}
            body={t("emptyBody")}
            action={
              <>
                <RetryButton />
                <LinkButton href="/contact" variant="outline">
                  {tNav("contact")}
                </LinkButton>
              </>
            }
          />
        ) : (
          <EmptyState
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={<LinkButton href="/contact">{tNav("contact")}</LinkButton>}
          />
        )}
      </Section>
    </>
  );
}
