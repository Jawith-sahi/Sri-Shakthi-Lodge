// JSON-LD builders. They only emit fields backed by real, verified data - nothing is invented:
//  * street address / postal code / phone appear only once marked verified in src/config/lodge.js
//  * geo appears only when real coordinates are configured
//  * prices only from the API, ratings only from real approved reviews (and only when at least one exists)

import { env } from "@/config/environment";
import { getPublicPhones, lodge } from "@/config/lodge";
import { absoluteUrl } from "@/lib/seo/metadata";
import { pick } from "@/lib/utils/localize";

export function lodgingBusinessJsonLd({ locale, description, image, reviews = [], sameAs = [] }) {
  const a = lodge.address;
  const phones = getPublicPhones().filter((p) => p.verified);
  const approvedRatings = reviews.map((r) => Number(r.rating)).filter((n) => n >= 1 && n <= 5);

  const data = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    "@id": `${env.siteUrl}/#lodge`,
    name: lodge.name,
    url: absoluteUrl(locale, "/"),
    ...(description ? { description } : {}),
    ...(image ? { image: image.startsWith("http") ? image : `${env.siteUrl}${image}` } : {}),
    address: {
      "@type": "PostalAddress",
      ...(a.verified ? { streetAddress: a.line1 } : {}),
      addressLocality: a.district,
      addressRegion: a.state,
      ...(a.postalCodeVerified ? { postalCode: a.postalCode } : {}),
      addressCountry: a.countryCode,
    },
    ...(phones.length ? { telephone: `+91${phones[0].digits}` } : {}),
    ...(lodge.geo ? { geo: { "@type": "GeoCoordinates", latitude: lodge.geo.latitude, longitude: lodge.geo.longitude } } : {}),
    checkinTime: lodge.checkIn.verified ? lodge.checkIn.time : undefined,
    checkoutTime: lodge.checkOut.verified ? lodge.checkOut.time : undefined,
    amenityFeature: lodge.amenities
      .filter((am) => am.verified)
      .map((am) => ({ "@type": "LocationFeatureSpecification", name: am.key === "wifi" ? "Wi-Fi" : am.key, value: true })),
    ...(sameAs.length ? { sameAs } : {}),
  };

  if (approvedRatings.length > 0) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number((approvedRatings.reduce((s, n) => s + n, 0) / approvedRatings.length).toFixed(1)),
      reviewCount: approvedRatings.length,
      bestRating: 5,
      worstRating: 1,
    };
  }
  return stripUndefined(data);
}

/** Room page: HotelRoom (+ Offer only when a real price exists). */
export function hotelRoomJsonLd({ locale, room }) {
  const name = pick(room.name, locale);
  const data = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name,
    url: absoluteUrl(locale, `/rooms/${room.slug}`),
    description: pick(room.description, locale) || undefined,
    image: room.images?.[0]?.url ? [room.images[0].url] : undefined,
    occupancy: room.maxOccupancy
      ? { "@type": "QuantitativeValue", maxValue: Number(room.maxOccupancy) }
      : undefined,
    containedInPlace: { "@type": "LodgingBusiness", "@id": `${env.siteUrl}/#lodge`, name: lodge.name },
    ...(Number.isFinite(Number(room.startingPrice)) && Number(room.startingPrice) > 0
      ? {
          offers: {
            "@type": "Offer",
            price: Number(room.startingPrice),
            priceCurrency: room.currency || "INR",
            url: absoluteUrl(locale, `/rooms/${room.slug}`),
          },
        }
      : {}),
  };
  return stripUndefined(data);
}

export function breadcrumbJsonLd(locale, items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(locale, item.path),
    })),
  };
}

/** Only call with REAL FAQ entries. Returns null when there are none. */
export function faqJsonLd(faqs) {
  const valid = (faqs || []).filter((f) => f.question && f.answer);
  if (!valid.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: valid.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

function stripUndefined(value) {
  return JSON.parse(JSON.stringify(value));
}
