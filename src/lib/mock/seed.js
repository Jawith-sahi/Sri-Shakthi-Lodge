// =====================================================================
// MOCK / SAMPLE DATA - DEVELOPMENT ONLY.
// Everything here is invented so the UI can be built and demoed before the .NET API exists.
// Prices, occupancy, reviews, bookings etc. are NOT real. The app shows a visible banner in mock mode and
// refuses to build for production while NEXT_PUBLIC_USE_MOCK=true.
// =====================================================================

const img = (name) => `/placeholders/${name}.svg`;

export const SAMPLE_NOTE = "Sample data (mock mode) - not real information.";

const room = (id, slug, nameEn, nameTa, isAc, occupancy, price, units) => ({
  id,
  slug,
  name: { en: nameEn, ta: nameTa },
  shortDescription: { en: `${SAMPLE_NOTE}`, ta: "மாதிரி தரவு (மாக் முறை) - உண்மையான தகவல் அல்ல." },
  description: {
    en: `${SAMPLE_NOTE} Real room descriptions will be added by the lodge from Admin > Rooms.`,
    ta: "மாதிரி தரவு. உண்மையான அறை விவரங்களை விடுதி நிர்வாகம் சேர்க்கும்.",
  },
  isAc,
  maxOccupancy: occupancy,
  startingPrice: price,
  currency: "INR",
  amenities: [
    { key: "wifi", label: { en: "Wi-Fi", ta: "வை-பை" } },
    ...(isAc ? [{ key: "ac", label: { en: "Air conditioning", ta: "குளிர்சாதன வசதி" } }] : []),
  ],
  images: [{ id: `${id}-1`, url: img("room"), alt: { en: `${nameEn} (placeholder photo)`, ta: `${nameTa} (மாதிரி படம்)` } }],
  roomNumbers: Array.from({ length: units }, (_, i) => `${id.toUpperCase()}-${i + 1}`),
  totalUnits: units,
  isActive: true,
});

export const seedRooms = [
  room("single-bed", "single-bed", "Single Bed", "ஒற்றை படுக்கை", false, 2, 900, 8),
  room("double-bed", "double-bed", "Double Bed", "இரட்டை படுக்கை", false, 3, 1300, 5),
  room("three-bed", "three-bed", "Three Bed", "மூன்று படுக்கை", false, 4, 1700, 1),
  room("five-bed", "five-bed", "Five Bed", "ஐந்து படுக்கை", false, 6, 2400, 1),
  room("standard-ac", "standard-ac", "Standard A/C", "ஸ்டாண்டர்டு ஏசி", true, 3, 1800, 3),
  room("deluxe-ac", "deluxe-ac", "Deluxe A/C", "டீலக்ஸ் ஏசி", true, 3, 2300, 1),
  room("ac-suite", "ac-suite", "A/C Suite", "ஏசி சூட்", true, 4, 3200, 2),
];

export const seedOffers = [
  {
    id: "offer-1",
    title: { en: "Sample offer (mock)", ta: "மாதிரி சலுகை (மாக்)" },
    description: { en: SAMPLE_NOTE, ta: "மாதிரி தரவு." },
    imageUrl: img("offer"),
    startDate: "2026-01-01",
    endDate: "2099-12-31",
    terms: { en: "Sample terms. Real offers are created by the lodge.", ta: "மாதிரி நிபந்தனைகள்." },
    isPublished: true,
  },
];

export const seedGallery = [
  { id: "g1", type: "image", url: img("gallery"), title: { en: "Sample photo - rooms", ta: "மாதிரி படம் - அறைகள்" }, alt: { en: "Placeholder photo of a room", ta: "அறையின் மாதிரி படம்" }, category: "rooms", order: 1, isPublished: true },
  { id: "g2", type: "image", url: img("gallery"), title: { en: "Sample photo - property", ta: "மாதிரி படம் - கட்டிடம்" }, alt: { en: "Placeholder photo of the property", ta: "கட்டிடத்தின் மாதிரி படம்" }, category: "property", order: 2, isPublished: true },
  { id: "g3", type: "image", url: img("gallery"), title: { en: "Sample photo - surroundings", ta: "மாதிரி படம் - சுற்றுப்புறம்" }, alt: { en: "Placeholder photo of the surroundings", ta: "சுற்றுப்புறத்தின் மாதிரி படம்" }, category: "surroundings", order: 3, isPublished: true },
];

export const seedAttractions = [
  { id: "a1", slug: "kanyakumari-sunrise", name: { en: "Kanyakumari Sunrise", ta: "கன்னியாகுமரி சூரிய உதயம்" }, description: { en: SAMPLE_NOTE, ta: "மாதிரி தரவு." }, category: "viewpoint", imageUrl: img("attraction"), mapsUrl: "", isPublished: true, order: 1 },
  { id: "a2", slug: "vivekananda-rock-memorial", name: { en: "Vivekananda Rock Memorial", ta: "விவேகானந்தர் நினைவு மண்டபம்" }, description: { en: SAMPLE_NOTE, ta: "மாதிரி தரவு." }, category: "monument", imageUrl: img("attraction"), mapsUrl: "", isPublished: true, order: 2 },
  { id: "a3", slug: "thiruvalluvar-statue", name: { en: "Thiruvalluvar Statue", ta: "திருவள்ளுவர் சிலை" }, description: { en: SAMPLE_NOTE, ta: "மாதிரி தரவு." }, category: "monument", imageUrl: img("attraction"), mapsUrl: "", isPublished: true, order: 3 },
];

export const seedReviews = [
  // Clearly labelled sample reviews. They only exist in mock mode.
  { id: "r1", name: "Sample Guest", rating: 5, text: "SAMPLE REVIEW (mock mode) - not a real guest review.", createdAt: "2026-01-10T10:00:00Z", status: "approved" },
  { id: "r2", name: "Sample Pending", rating: 4, text: "SAMPLE pending review (mock mode).", createdAt: "2026-02-10T10:00:00Z", status: "pending" },
];

export const seedContent = {
  about: {
    en: "",
    ta: "",
  },
  announcement: { active: false, text: { en: "", ta: "" } },
  faq: [],
  policies: { cancellation: { en: "", ta: "" }, terms: { en: "", ta: "" }, privacy: { en: "", ta: "" } },
  seo: {},
};

export const seedEnquiries = [
  { id: "e1", name: "Sample Visitor", phone: "9000000001", email: "", subject: "Sample enquiry", message: "SAMPLE enquiry (mock mode).", status: "new", notes: "", createdAt: "2026-10-25T08:30:00Z" },
  { id: "e2", name: "Sample Visitor 2", phone: "9000000002", email: "sample@example.com", subject: "Sample enquiry 2", message: "SAMPLE enquiry (mock mode).", status: "read", notes: "", createdAt: "2026-10-24T08:30:00Z" },
];

export const seedTariffs = [
  { id: "t1", roomId: "single-bed", planName: "Standard", baseRate: 900, startDate: "2026-01-01", endDate: "2026-12-31", season: "Regular", taxPercent: null, isActive: true },
  { id: "t2", roomId: "double-bed", planName: "Standard", baseRate: 1300, startDate: "2026-01-01", endDate: "2026-12-31", season: "Regular", taxPercent: null, isActive: true },
];

export const seedBookings = [
  {
    id: "b1",
    reference: "SSL-DEMO-0001",
    status: "confirmed",
    paymentStatus: "partial",
    source: "online",
    roomId: "double-bed",
    roomName: "Double Bed",
    roomNumber: "DOUBLE-BED-2",
    checkIn: "2026-10-27",
    checkOut: "2026-10-29",
    nights: 2,
    adults: 2,
    children: 0,
    rooms: 1,
    totalAmount: 2600,
    amountPaid: 500,
    balanceAmount: 2100,
    currency: "INR",
    guest: { id: "gu1", name: "Sample Guest One", phone: "9000000011", email: "", idType: "Aadhaar", notes: "" },
    createdAt: "2026-10-20T06:00:00Z",
    payments: [{ id: "p1", method: "online", amount: 500, status: "paid", reference: "MOCK-PAY-1", paidAt: "2026-10-20T06:05:00Z" }],
    history: [{ status: "pending", at: "2026-10-20T06:00:00Z", by: "system" }, { status: "confirmed", at: "2026-10-20T06:05:00Z", by: "system" }],
    notes: "",
  },
  {
    id: "b2",
    reference: "SSL-DEMO-0002",
    status: "pending",
    paymentStatus: "unpaid",
    source: "online",
    roomId: "standard-ac",
    roomName: "Standard A/C",
    roomNumber: "",
    checkIn: "2026-10-30",
    checkOut: "2026-10-31",
    nights: 1,
    adults: 2,
    children: 1,
    rooms: 1,
    totalAmount: 1800,
    amountPaid: 0,
    balanceAmount: 1800,
    currency: "INR",
    guest: { id: "gu2", name: "Sample Guest Two", phone: "9000000012", email: "sample@example.com", idType: "", notes: "" },
    createdAt: "2026-10-24T09:00:00Z",
    payments: [],
    history: [{ status: "pending", at: "2026-10-24T09:00:00Z", by: "system" }],
    notes: "",
  },
  {
    id: "b3",
    reference: "SSL-DEMO-0003",
    status: "checked_in",
    paymentStatus: "paid",
    source: "walk-in",
    roomId: "single-bed",
    roomName: "Single Bed",
    roomNumber: "SINGLE-BED-1",
    checkIn: "2026-10-26",
    checkOut: "2026-10-27",
    nights: 1,
    adults: 1,
    children: 0,
    rooms: 1,
    totalAmount: 900,
    amountPaid: 900,
    balanceAmount: 0,
    currency: "INR",
    guest: { id: "gu3", name: "Sample Guest Three", phone: "9000000013", email: "", idType: "Voter ID", notes: "" },
    createdAt: "2026-10-26T03:00:00Z",
    payments: [{ id: "p2", method: "cash", amount: 900, status: "paid", reference: "", paidAt: "2026-10-26T03:10:00Z" }],
    history: [{ status: "checked_in", at: "2026-10-26T03:10:00Z", by: "staff" }],
    notes: "",
  },
];
