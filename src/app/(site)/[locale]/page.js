import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Hero } from "@/components/home/Hero";
import { Section } from "@/components/common/Section";
import { SectionHeading } from "@/components/common/SectionHeading";
import { RoomCard } from "@/components/rooms/RoomCard";
import { AmenitiesGrid } from "@/components/home/AmenitiesGrid";
import { OfferCard } from "@/components/home/OfferCard";
import { AttractionCard } from "@/components/home/AttractionCard";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { FaqList } from "@/components/home/FaqList";
import { ContactInfo } from "@/components/contact/ContactInfo";
import { JsonLd } from "@/components/seo/JsonLd";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";
import { SmartImage } from "@/components/ui/SmartImage";
import { RetryButton } from "@/components/common/RetryButton";
import { getRooms } from "@/lib/api/rooms.api";
import { getOffers } from "@/lib/api/offers.api";
import { getGallery } from "@/lib/api/gallery.api";
import { getApprovedReviews } from "@/lib/api/reviews.api";
import { settle } from "@/lib/api/client";
import { loadAttractions, loadContent, loadFaq } from "@/lib/content";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqJsonLd, lodgingBusinessJsonLd } from "@/lib/seo/jsonld";
import { pick } from "@/lib/utils/localize";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.home" });
  return buildMetadata({ locale, path: "/", title: { absolute: t("title") }, description: t("description") });
}

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, tr, tNav] = await Promise.all([
    getTranslations("home"),
    getTranslations("rooms"),
    getTranslations("nav"),
  ]);

  const [roomsResult, offersResult, galleryResult, reviewsResult, content, attractions] = await Promise.all([
    settle(getRooms()),
    settle(getOffers()),
    settle(getGallery()),
    settle(getApprovedReviews()),
    loadContent(),
    loadAttractions(locale),
  ]);

  const rooms = roomsResult.data || [];
  const offers = offersResult.data || [];
  const gallery = (galleryResult.data || []).filter((g) => g.type !== "video").slice(0, 6);
  const reviews = reviewsResult.data || [];
  const faq = await loadFaq(locale, content);

  const aboutText = pick(content.about, locale) || (await getTranslations("about"))("defaultBody");
  const metaDescription = (await getTranslations({ locale, namespace: "meta.home" }))("description");

  return (
    <>
      <JsonLd
        data={[
          lodgingBusinessJsonLd({ locale, description: metaDescription, image: "/og-default.jpg", reviews }),
          faqJsonLd(faq),
        ]}
      />

      <Hero imageUrl={content.heroImageUrl} />

      {/* Rooms */}
      <Section labelledBy="rooms-title">
        <SectionHeading id="rooms-title" title={t("roomsTitle")} subtitle={t("roomsSubtitle")} />
        {rooms.length ? (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <li key={room.id || room.slug}>
                  <RoomCard room={room} />
                </li>
              ))}
            </ul>
            <div className="mt-8 text-center">
              <LinkButton href="/rooms" variant="outline">
                {tr("allRooms")}
              </LinkButton>
            </div>
          </>
        ) : (
          <EmptyState
            title={roomsResult.error && roomsResult.error.code !== "not_configured" ? tr("errorTitle") : tr("emptyTitle")}
            body={tr("emptyBody")}
            action={
              <>
                <LinkButton href="/contact">{tNav("contact")}</LinkButton>
                {roomsResult.error && roomsResult.error.code !== "not_configured" ? <RetryButton /> : null}
              </>
            }
          />
        )}
      </Section>

      {/* About */}
      <Section tone="muted" labelledBy="about-title">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading id="about-title" title={t("aboutTitle")} className="mb-5" />
            <div className="space-y-4 text-ink">
              {aboutText.split(/\n\s*\n/).map((para, i) => (
                <p key={i} className="leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
            <Link href="/about" className="mt-5 inline-block font-semibold text-primary hover:underline">
              {t("learnMore")} →
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]">
            <SmartImage
              src={content.aboutImageUrl || "/placeholders/about.svg"}
              alt=""
              fill
              sizes="(min-width: 1024px) 480px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </Section>

      {/* Amenities */}
      <Section labelledBy="amenities-title">
        <SectionHeading id="amenities-title" title={t("amenitiesTitle")} />
        <AmenitiesGrid cmsAmenities={content.amenities} />
      </Section>

      {/* Offers (published + currently valid only) */}
      {offers.length ? (
        <Section tone="muted" labelledBy="offers-title">
          <SectionHeading id="offers-title" title={t("offersTitle")} />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <li key={offer.id}>
                <OfferCard offer={offer} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Gallery preview */}
      {gallery.length ? (
        <Section labelledBy="gallery-title">
          <SectionHeading id="gallery-title" title={t("galleryTitle")} />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((item) => (
              <li key={item.id}>
                <Link href="/gallery" className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-surface">
                  <SmartImage
                    src={item.url}
                    alt={pick(item.alt, locale) || pick(item.title, locale)}
                    fill
                    sizes="(min-width: 1024px) 352px, 50vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <LinkButton href="/gallery" variant="outline">
              {tNav("gallery")}
            </LinkButton>
          </div>
        </Section>
      ) : null}

      {/* Attractions */}
      <Section tone="muted" labelledBy="attractions-title">
        <SectionHeading id="attractions-title" title={t("attractionsTitle")} subtitle={t("attractionsSubtitle")} />
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {attractions.items.slice(0, 6).map((a) => (
            <li key={a.id}>
              <AttractionCard attraction={a} />
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <LinkButton href="/attractions" variant="outline">
            {tNav("attractions")}
          </LinkButton>
        </div>
      </Section>

      {/* Reviews - hidden entirely when there are no approved reviews */}
      {reviews.length ? (
        <Section labelledBy="reviews-title">
          <SectionHeading id="reviews-title" title={t("reviewsTitle")} />
          <ul className="grid gap-6 md:grid-cols-3">
            {reviews.slice(0, 3).map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <LinkButton href="/reviews" variant="outline">
              {t("reviewsTitle")}
            </LinkButton>
          </div>
        </Section>
      ) : null}

      {/* FAQ */}
      <Section tone={reviews.length ? "muted" : "white"} labelledBy="faq-title">
        <div className="mx-auto max-w-3xl">
          <SectionHeading id="faq-title" title={t("faqTitle")} />
          <FaqList items={faq} />
        </div>
      </Section>

      {/* Contact & location */}
      <Section tone={reviews.length ? "white" : "muted"} labelledBy="contact-title">
        <SectionHeading id="contact-title" title={t("contactTitle")} />
        <div className="max-w-2xl">
          <ContactInfo compact />
        </div>
      </Section>
    </>
  );
}
