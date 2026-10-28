// =====================================================================
// SRI SAKTHI LODGE - single source of truth for business facts.
//
// Rules:
//  * Never add a price, size, distance, rating, statistic or opening time that the
//    client has not confirmed. Missing information => leave it null / empty.
//  * Anything not yet confirmed carries `// TODO(verify)` and `verified: false`.
//    Unverified values are NOT published as final facts by the UI.
//  * Later these values can be served by the CMS/API (see Admin > Content).
// =====================================================================

import { env } from "@/config/environment";

export const lodge = {
  name: "Sri Sakthi Lodge",
  shortName: "Sri Sakthi",

  // --- Address -------------------------------------------------------
  address: {
    // TODO(verify): exact wording of the postal address with the client.
    line1: "Friday Market Junction, towards kurunthancodu Road",
    district: "Kanyakumari District",
    state: "Tamil Nadu",
    country: "India",
    countryCode: "IN",
    // TODO(verify): 625203 looks inconsistent with Kanyakumari District (PINs there usually start with 629).
    // Confirm with the client. The UI and JSON-LD only show the PIN when `verified` is true.
    postalCode: "625203",
    postalCodeVerified: false,
    verified: false,
  },

  // --- Phones --------------------------------------------------------
  // Only COMPLETE numbers are ever displayed or linked. `digits` must be 10 digits (Indian mobile).
  phones: [
    {
      name: "S. Rasa",
      digits: "7200074204", // TODO(verify): number provided as "72000 74204"
      verified: false,
      primary: true,
    },
    {
      name: "M. Radhakrishnan",
      digits: null, // TODO(verify): client note reads "94893 5545?" - INCOMPLETE. Do not publish until confirmed.
      partial: "94893 5545?",
      verified: false,
      primary: false,
    },
  ],
  // TODO(verify): which number is for calls and which one is on WhatsApp (the banner shows both).
  // WhatsApp is configured with NEXT_PUBLIC_WHATSAPP_NUMBER and is hidden when empty.
  whatsappNumber: env.whatsappNumber || null,
  email: null, // TODO(verify): no official email supplied yet.

  // --- Location ------------------------------------------------------
  // TODO(verify): exact Google Maps link pending. NEVER show an approximate location as exact.
  mapsUrl: null,
  mapsEmbedUrl: null,
  geo: null, // { latitude, longitude } only once the exact point is confirmed

  // --- Times ---------------------------------------------------------
  checkIn: { time: "12:00", label: "12:00 noon", verified: true },
  // TODO(verify): client notes say both 12:00 noon and 11:00 AM for check-out. Not published as final.
  checkOut: { time: "12:00", label: "12:00 noon", verified: false },

  // Late check-out (client-confirmed rule). Subject to availability, never guaranteed.
  lateCheckout: {
    verified: true,
    bands: [
      { from: "11:00", to: "13:00", kind: "free" },
      { from: "13:00", to: "17:00", kind: "percentUpTo", percent: 30 },
      { from: "17:00", to: null, kind: "percent", percent: 100 },
    ],
  },

  // --- Amenities (confirmed so far). Keys are translated in messages ("amenities.*") ---------
  amenities: [
    { key: "wifi", icon: "Wifi", verified: true },
    // Parking is opposite the property, ~200 m away. Worded so guests do not assume on-site parking.
    { key: "parking", icon: "Car", verified: true },
    // TODO(verify): whether the complimentary breakfast (8:00-10:00 AM) applies to ALL bookings.
    {
      key: "breakfast",
      icon: "Coffee",
      verified: false,
      hours: "8:00 AM - 10:00 AM",
    },
  ],

  // --- Room categories (names only). Counts, prices and occupancy ALWAYS come from the API. -----
  // NOTE: client notes mention 17 rooms but the categories add up to 21 - do NOT show any fixed total.
  roomCategories: [
    "Single Bed",
    "Double Bed",
    "Three Bed",
    "Five Bed",
    "Standard A/C",
    "Deluxe A/C",
    "A/C Suite",
  ],

  // --- Payments accepted ---------------------------------------------
  // Gateway fees are borne separately by the client.
  paymentMethods: ["phonepe", "cash", "online"],

  // --- Rules ----------------------------------------------------------
  rules: ["noLiquor", "damageLiability"],

  // --- Nearby places (names only; NO distances or travel times) ------------------------------
  // Used as a fallback when the Attractions API has no published entries.
  defaultAttractions: [
    { slug: "kanyakumari-sunrise", key: "sunrise", category: "viewpoint" },
    {
      slug: "vivekananda-rock-memorial",
      key: "vivekananda",
      category: "monument",
    },
    {
      slug: "thiruvalluvar-statue",
      key: "thiruvalluvar",
      category: "monument",
    },
    { slug: "local-temples", key: "temples", category: "temple" },
    { slug: "beaches", key: "beaches", category: "beach" },
  ],

  // Booking form limits (UI only - the backend enforces real limits)
  limits: {
    maxAdults: 10,
    maxChildren: 6,
    maxRooms: 5,
    maxNights: 30,
  },

  // Default SEO values, overridable from the CMS
  seo: {
    titleDefault: "Sri Sakthi Lodge | Lodge in Kanyakumari",
  },
};

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------

export const isCompletePhone = (phone) =>
  Boolean(phone && /^\d{10}$/.test(phone.digits || ""));

/** Complete phone numbers only, primary first. */
export function getPublicPhones() {
  return lodge.phones
    .filter(isCompletePhone)
    .sort((a, b) => Number(b.primary) - Number(a.primary))
    .map((p) => ({
      ...p,
      display: `${p.digits.slice(0, 5)} ${p.digits.slice(5)}`,
      tel: `+91${p.digits}`,
    }));
}

export function getPrimaryPhone() {
  return getPublicPhones()[0] || null;
}

/** WhatsApp link (digits in international format) or null when not configured. */
export function getWhatsAppUrl(message) {
  if (!lodge.whatsappNumber) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${lodge.whatsappNumber}${text}`;
}

/** Address as one line. The PIN is only included once verified. */
export function getAddressLine() {
  const a = lodge.address;
  const parts = [a.line1, a.district, a.state];
  if (a.postalCodeVerified) parts.push(a.postalCode);
  return parts.filter(Boolean).join(", ");
}

/** Only return a Google Maps URL when it looks like a real one. */
export function getValidMapsUrl(url = lodge.mapsUrl) {
  if (!url) return null;
  try {
    const u = new URL(url);
    const ok =
      /(^|\.)google\.[a-z.]+$/i.test(u.hostname) ||
      u.hostname === "maps.app.goo.gl" ||
      u.hostname === "goo.gl";
    return ok && u.protocol === "https:" ? u.toString() : null;
  } catch {
    return null;
  }
}
