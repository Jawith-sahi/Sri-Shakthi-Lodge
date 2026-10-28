// =====================================================================
// MOCK API - DEVELOPMENT ONLY (NEXT_PUBLIC_USE_MOCK=true).
// Mirrors the shapes the real .NET API is expected to return (see README -> API contract).
// Loaded with dynamic import() from the *.api.js modules, so it is never part of the normal bundles.
// =====================================================================

import { ApiError } from "@/lib/api/client";
import {
  seedAttractions,
  seedBookings,
  seedContent,
  seedEnquiries,
  seedGallery,
  seedOffers,
  seedReviews,
  seedRooms,
  seedTariffs,
} from "@/lib/mock/seed";
import { nightsBetween, todayIST } from "@/lib/utils/format";

const clone = (v) => JSON.parse(JSON.stringify(v));
const wait = (ms = 220) => new Promise((r) => setTimeout(r, ms));
const uid = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

// --- in-memory store (per runtime) -----------------------------------
const db = {
  rooms: clone(seedRooms),
  offers: clone(seedOffers),
  gallery: clone(seedGallery),
  attractions: clone(seedAttractions),
  reviews: clone(seedReviews),
  content: clone(seedContent),
  enquiries: clone(seedEnquiries),
  tariffs: clone(seedTariffs),
  bookings: clone(seedBookings),
  blocked: {},
  staff: [
    { id: "u1", name: "Sample Owner", username: "owner", role: "owner", isActive: true },
    { id: "u2", name: "Sample Staff", username: "staff", role: "staff", isActive: true },
  ],
};

const notFound = () => new ApiError({ status: 404, code: "not_found", message: "Not found." });
const invalid = (message, fieldErrors = {}) =>
  new ApiError({ status: 400, code: "validation", message, serverMessage: message, fieldErrors });
const conflict = (message) => new ApiError({ status: 409, code: "conflict", message, serverMessage: message });

function paginate(items, { page = 1, pageSize = 20 } = {}) {
  const p = Number(page) || 1;
  const size = Number(pageSize) || 20;
  const start = (p - 1) * size;
  return {
    items: clone(items.slice(start, start + size)),
    page: p,
    pageSize: size,
    totalCount: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / size)),
  };
}

function textMatch(obj, q) {
  if (!q) return true;
  return JSON.stringify(obj).toLowerCase().includes(String(q).toLowerCase());
}

function sortBy(items, sort, dir) {
  if (!sort) return items;
  const m = dir === "desc" ? -1 : 1;
  return [...items].sort((a, b) => {
    const x = a[sort];
    const y = b[sort];
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    return (x > y ? 1 : x < y ? -1 : 0) * m;
  });
}

// --- auth -------------------------------------------------------------
const SESSION_KEY = "sl_mock_user";
function readSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

const auth = {
  async login({ username, password }) {
    await wait();
    if (!username || !password) throw invalid("Enter your username and password.");
    // DEV-ONLY mock sign-in: any non-empty credentials work. A username containing "staff" gets the staff role.
    const user = {
      id: "mock-user",
      name: /staff/i.test(username) ? "Sample Staff" : "Sample Owner",
      username,
      role: /staff/i.test(username) ? "staff" : "owner",
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return clone(user);
  },
  async logout() {
    await wait(80);
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  },
  async me() {
    await wait(80);
    const user = readSession();
    if (!user) throw new ApiError({ status: 401, code: "unauthorized", message: "Please sign in." });
    return clone(user);
  },
  async changePassword({ currentPassword, newPassword }) {
    await wait();
    if (!currentPassword || !newPassword) throw invalid("Both passwords are required.");
    return null;
  },
};

// --- rooms ------------------------------------------------------------
const publicRoom = (r) => {
  const { roomNumbers, totalUnits, ...rest } = r;
  void roomNumbers;
  void totalUnits;
  return rest;
};

function unitsLeft(room, checkIn, checkOut) {
  const used = db.bookings
    .filter(
      (b) =>
        b.roomId === room.id &&
        b.status !== "cancelled" &&
        b.checkIn < checkOut &&
        b.checkOut > checkIn
    )
    .reduce((n, b) => n + (b.rooms || 1), 0);
  const blocked = (db.blocked[room.id] || []).filter((x) => x.from < checkOut && x.to >= checkIn).length;
  return Math.max(0, room.totalUnits - used - blocked);
}

const rooms = {
  async list() {
    await wait();
    return clone(db.rooms.filter((r) => r.isActive).map(publicRoom));
  },
  async detail(slug) {
    await wait();
    const r = db.rooms.find((x) => x.slug === slug && x.isActive);
    if (!r) throw notFound();
    return clone(publicRoom(r));
  },
  async availability(params) {
    await wait(350);
    const { checkIn, checkOut, adults = 1, children = 0, rooms: roomCount = 1, category } = params;
    const nights = nightsBetween(checkIn, checkOut);
    if (!nights) throw invalid("Check-out must be after check-in.", { checkOut: "Check-out must be after check-in." });
    const results = db.rooms
      .filter((r) => r.isActive)
      .filter((r) => (category === "ac" ? r.isAc : category === "non-ac" ? !r.isAc : true))
      .map((r) => {
        const available = unitsLeft(r, checkIn, checkOut);
        const total = r.startingPrice * nights * Number(roomCount);
        return {
          roomId: r.id,
          slug: r.slug,
          name: r.name,
          isAc: r.isAc,
          maxOccupancy: r.maxOccupancy,
          images: r.images,
          availableCount: available,
          fitsGuests: Number(adults) + Number(children) <= r.maxOccupancy * Number(roomCount),
          ratePerNight: r.startingPrice,
          totalAmount: total,
          advanceAmount: Math.round(total * 0.25), // MOCK rule only - the real backend decides advances.
          taxes: [],
        };
      });
    return {
      checkIn,
      checkOut,
      nights,
      adults: Number(adults),
      children: Number(children),
      rooms: Number(roomCount),
      currency: "INR",
      paymentOptions: ["online", "payAtHotel"],
      results,
    };
  },
  admin: {
    async list(params = {}) {
      await wait();
      let items = db.rooms.filter((r) => textMatch(r, params.q));
      if (params.status === "active") items = items.filter((r) => r.isActive);
      if (params.status === "inactive") items = items.filter((r) => !r.isActive);
      return paginate(sortBy(items, params.sort, params.dir), params);
    },
    async detail(id) {
      await wait();
      const r = db.rooms.find((x) => x.id === id);
      if (!r) throw notFound();
      return clone(r);
    },
    async create(data) {
      await wait();
      if (!data.name?.en) throw invalid("Room name is required.", { name: "Required" });
      const slug = (data.slug || data.name.en).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      if (db.rooms.some((r) => r.slug === slug)) throw conflict("A room with this name already exists.");
      const r = { ...data, id: uid("room"), slug, images: data.images || [], roomNumbers: data.roomNumbers || [], totalUnits: (data.roomNumbers || []).length || 1, isActive: true };
      db.rooms.push(r);
      return clone(r);
    },
    async update(id, data) {
      await wait();
      const i = db.rooms.findIndex((x) => x.id === id);
      if (i < 0) throw notFound();
      db.rooms[i] = { ...db.rooms[i], ...data, id, totalUnits: (data.roomNumbers || db.rooms[i].roomNumbers || []).length || db.rooms[i].totalUnits };
      return clone(db.rooms[i]);
    },
    async setActive(id, isActive) {
      await wait();
      const r = db.rooms.find((x) => x.id === id);
      if (!r) throw notFound();
      r.isActive = Boolean(isActive);
      return clone(r);
    },
    async remove(id) {
      await wait();
      if (db.bookings.some((b) => b.roomId === id && b.status !== "cancelled" && b.status !== "checked_out")) {
        throw conflict("This room has active bookings and cannot be deleted. Deactivate it instead.");
      }
      db.rooms = db.rooms.filter((x) => x.id !== id);
      return null;
    },
    async uploadImage(id, file) {
      await wait(500);
      const r = db.rooms.find((x) => x.id === id);
      if (!r) throw notFound();
      // Mock: no real storage, so reuse the placeholder image but keep the file name for the alt text.
      const image = { id: uid("img"), url: "/placeholders/room.svg", alt: { en: file?.name || "Room photo", ta: "" } };
      r.images.push(image);
      return clone(image);
    },
    async deleteImage(id, imageId) {
      await wait(150);
      const r = db.rooms.find((x) => x.id === id);
      if (!r) throw notFound();
      r.images = r.images.filter((i) => i.id !== imageId);
      return null;
    },
    async reorderImages(id, order) {
      await wait(150);
      const r = db.rooms.find((x) => x.id === id);
      if (!r) throw notFound();
      r.images = order.map((imgId) => r.images.find((i) => i.id === imgId)).filter(Boolean);
      return clone(r.images);
    },
    async blockedDates(id) {
      await wait(150);
      return clone(db.blocked[id] || []);
    },
    async addBlockedDate(id, data) {
      await wait(150);
      if (!data.from || !data.to || data.to < data.from) throw invalid("Choose a valid date range.");
      const item = { id: uid("blk"), from: data.from, to: data.to, reason: data.reason || "" };
      db.blocked[id] = [...(db.blocked[id] || []), item];
      return clone(item);
    },
    async removeBlockedDate(id, blockId) {
      await wait(150);
      db.blocked[id] = (db.blocked[id] || []).filter((x) => x.id !== blockId);
      return null;
    },
  },
};

// --- bookings & payments ------------------------------------------------
const MOCK_TOKEN = "mock-token";
const publicBooking = (b) => ({
  reference: b.reference,
  status: b.status,
  paymentStatus: b.paymentStatus,
  guestName: b.guest.name,
  roomName: b.roomName,
  checkIn: b.checkIn,
  checkOut: b.checkOut,
  nights: b.nights,
  adults: b.adults,
  children: b.children,
  rooms: b.rooms,
  totalAmount: b.totalAmount,
  amountPaid: b.amountPaid,
  balanceAmount: b.balanceAmount,
  currency: b.currency,
  createdAt: b.createdAt,
  paymentMethod: b.paymentMethod || (b.source === "walk-in" ? "payAtHotel" : "online"),
  advanceAmount: Math.round(b.totalAmount * 0.25), // MOCK rule only - the real backend decides advances.
  canPay: b.status === "pending" && b.amountPaid === 0 && (b.paymentMethod || "online") === "online",
  canCancel: ["pending", "confirmed"].includes(b.status),
});

const ALLOWED = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["checked_in", "cancelled"],
  checked_in: ["checked_out"],
  checked_out: [],
  cancelled: [],
};

const withTransitions = (b) => ({ ...clone(b), allowedTransitions: ALLOWED[b.status] || [] });

const bookings = {
  async create(payload) {
    await wait(450);
    const room = db.rooms.find((r) => r.id === payload.roomId);
    if (!room) throw notFound();
    const nights = nightsBetween(payload.checkIn, payload.checkOut);
    if (!nights) throw invalid("Check-out must be after check-in.");
    if (unitsLeft(room, payload.checkIn, payload.checkOut) < (payload.rooms || 1)) {
      throw conflict("Sorry, this room is no longer available for those dates.");
    }
    const total = room.startingPrice * nights * (payload.rooms || 1);
    const booking = {
      id: uid("b"),
      reference: `SSL-MOCK-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      status: "pending",
      paymentStatus: "unpaid",
      source: "online",
      roomId: room.id,
      roomName: room.name.en,
      roomNumber: "",
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      nights,
      adults: payload.adults,
      children: payload.children || 0,
      rooms: payload.rooms || 1,
      totalAmount: total,
      amountPaid: 0,
      balanceAmount: total,
      currency: "INR",
      guest: { id: uid("gu"), ...payload.guest, idType: "" },
      createdAt: new Date().toISOString(),
      payments: [],
      history: [{ status: "pending", at: new Date().toISOString(), by: "system" }],
      notes: payload.guest?.notes || "",
      paymentMethod: payload.paymentMethod,
    };
    db.bookings.unshift(booking);
    return {
      reference: booking.reference,
      accessToken: MOCK_TOKEN,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalAmount: total,
      advanceAmount: Math.round(total * 0.25),
      balanceAmount: total,
      currency: "INR",
    };
  },
  async publicGet(reference, token) {
    await wait();
    const b = db.bookings.find((x) => x.reference === reference);
    if (!b || token !== MOCK_TOKEN) throw notFound();
    return publicBooking(b);
  },
  async lookup({ reference, phone }) {
    await wait();
    const b = db.bookings.find((x) => x.reference.toLowerCase() === String(reference).trim().toLowerCase());
    if (!b || b.guest.phone !== String(phone).trim()) throw notFound();
    return { booking: publicBooking(b), accessToken: MOCK_TOKEN };
  },
  async cancel(reference, payload) {
    await wait(400);
    const b = db.bookings.find((x) => x.reference === reference);
    if (!b || payload.token !== MOCK_TOKEN) throw notFound();
    if (!["pending", "confirmed"].includes(b.status)) throw conflict("This booking can no longer be cancelled online.");
    b.status = "cancelled";
    b.paymentStatus = b.amountPaid > 0 ? "refund_pending" : b.paymentStatus;
    b.history.push({ status: "cancelled", at: new Date().toISOString(), by: "guest" });
    return publicBooking(b);
  },
  admin: {
    async list(params = {}) {
      await wait();
      let items = db.bookings.filter((b) => textMatch({ r: b.reference, g: b.guest.name, p: b.guest.phone }, params.q));
      if (params.status) items = items.filter((b) => b.status === params.status);
      if (params.paymentStatus) items = items.filter((b) => b.paymentStatus === params.paymentStatus);
      if (params.from) items = items.filter((b) => b.checkIn >= params.from);
      if (params.to) items = items.filter((b) => b.checkIn <= params.to);
      const rows = items.map((b) => ({ ...b, guestName: b.guest.name, guestPhone: b.guest.phone }));
      return paginate(sortBy(rows, params.sort || "createdAt", params.dir || "desc"), params);
    },
    async detail(id) {
      await wait();
      const b = db.bookings.find((x) => x.id === id);
      if (!b) throw notFound();
      return withTransitions(b);
    },
    async create(payload) {
      const result = await bookings.create({ ...payload, paymentMethod: "payAtHotel" });
      const b = db.bookings.find((x) => x.reference === result.reference);
      b.source = "walk-in";
      return withTransitions(b);
    },
    async updateStatus(id, status) {
      await wait();
      const b = db.bookings.find((x) => x.id === id);
      if (!b) throw notFound();
      if (!(ALLOWED[b.status] || []).includes(status)) {
        throw conflict(`A booking that is "${b.status}" cannot move to "${status}".`);
      }
      b.status = status;
      b.history.push({ status, at: new Date().toISOString(), by: "staff" });
      return withTransitions(b);
    },
    async cancel(id, payload) {
      return bookings.admin.updateStatus(id, "cancelled", payload);
    },
  },
};

const payments = {
  async createOrder({ bookingReference }) {
    await wait();
    const b = db.bookings.find((x) => x.reference === bookingReference);
    if (!b) throw notFound();
    return {
      orderId: `mock_order_${uid("o")}`,
      amount: Math.round(b.totalAmount * 0.25) * 100,
      currency: "INR",
      keyId: "mock",
      bookingReference,
      name: "Sri Sakthi Lodge",
      description: `Booking ${bookingReference} (MOCK payment)`,
      prefill: { name: b.guest.name, contact: b.guest.phone, email: b.guest.email || "" },
    };
  },
  async verify({ bookingReference, razorpayPaymentId }) {
    await wait(500);
    const b = db.bookings.find((x) => x.reference === bookingReference);
    if (!b) throw notFound();
    if (!razorpayPaymentId) return { verified: false, bookingStatus: b.status, paymentStatus: b.paymentStatus };
    const amount = Math.round(b.totalAmount * 0.25);
    b.amountPaid = amount;
    b.balanceAmount = b.totalAmount - amount;
    b.paymentStatus = "partial";
    b.status = "confirmed";
    b.payments.push({ id: uid("p"), method: "online", amount, status: "paid", reference: razorpayPaymentId, paidAt: new Date().toISOString() });
    b.history.push({ status: "confirmed", at: new Date().toISOString(), by: "system" });
    return { verified: true, bookingStatus: b.status, paymentStatus: b.paymentStatus, amountPaid: amount };
  },
  async status({ bookingReference }) {
    await wait(200);
    const b = db.bookings.find((x) => x.reference === bookingReference);
    if (!b) throw notFound();
    return { bookingReference, bookingStatus: b.status, paymentStatus: b.paymentStatus, verified: b.amountPaid > 0, amountPaid: b.amountPaid };
  },
};

// --- guests -------------------------------------------------------------
const guestList = () => {
  const map = new Map();
  db.bookings.forEach((b) => {
    const g = map.get(b.guest.phone) || { ...b.guest, bookings: [] };
    g.bookings.push(b);
    map.set(b.guest.phone, g);
  });
  return [...map.values()].map((g) => {
    const last = [...g.bookings].sort((a, b) => (a.checkIn < b.checkIn ? 1 : -1))[0];
    return {
      id: g.id,
      name: g.name,
      phone: g.phone,
      email: g.email || "",
      idType: g.idType || "",
      lastRoomNumber: last.roomNumber || "",
      lastCheckIn: last.checkIn,
      lastCheckOut: last.checkOut,
      notes: g.notes || "",
      bookingsCount: g.bookings.length,
    };
  });
};

const guests = {
  async list(params = {}) {
    await wait();
    const items = guestList().filter((g) => textMatch(g, params.q));
    return paginate(sortBy(items, params.sort, params.dir), params);
  },
  async detail(id) {
    await wait();
    const g = guestList().find((x) => x.id === id);
    if (!g) throw notFound();
    const history = db.bookings
      .filter((b) => b.guest.phone === g.phone)
      .map((b) => ({ id: b.id, reference: b.reference, roomName: b.roomName, checkIn: b.checkIn, checkOut: b.checkOut, status: b.status, totalAmount: b.totalAmount }));
    return { ...clone(g), history };
  },
};

// --- enquiries ------------------------------------------------------------
const enquiries = {
  async submit(data) {
    await wait(400);
    if (data.website) return null; // honeypot filled => silently ignore, like a real backend would
    db.enquiries.unshift({ id: uid("e"), ...data, status: "new", notes: "", createdAt: new Date().toISOString() });
    return { received: true };
  },
  admin: {
    async list(params = {}) {
      await wait();
      let items = db.enquiries.filter((e) => textMatch(e, params.q));
      if (params.status) items = items.filter((e) => e.status === params.status);
      return paginate(sortBy(items, params.sort || "createdAt", params.dir || "desc"), params);
    },
    async detail(id) {
      await wait();
      const e = db.enquiries.find((x) => x.id === id);
      if (!e) throw notFound();
      return clone(e);
    },
    async update(id, patch) {
      await wait(200);
      const e = db.enquiries.find((x) => x.id === id);
      if (!e) throw notFound();
      Object.assign(e, patch);
      return clone(e);
    },
  },
};

// --- generic CRUD for simple collections -----------------------------------
function makeCrud(key, { publicFilter, label }) {
  return {
    async publicList() {
      await wait();
      return clone(db[key].filter(publicFilter || (() => true)));
    },
    admin: {
      async list(params = {}) {
        await wait();
        let items = db[key].filter((x) => textMatch(x, params.q));
        if (params.status === "published") items = items.filter((x) => x.isPublished);
        if (params.status === "draft") items = items.filter((x) => !x.isPublished);
        if (params.status === "active") items = items.filter((x) => x.isActive);
        if (params.status === "inactive") items = items.filter((x) => x.isActive === false);
        return paginate(sortBy(items, params.sort, params.dir), params);
      },
      async create(data) {
        await wait(300);
        const item = { id: uid(label), ...data };
        if (key === "attractions" && !item.slug) {
          item.slug = (data.name?.en || "place").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        }
        db[key].push(item);
        return clone(item);
      },
      async update(id, data) {
        await wait(300);
        const i = db[key].findIndex((x) => x.id === id);
        if (i < 0) throw notFound();
        db[key][i] = { ...db[key][i], ...data, id };
        return clone(db[key][i]);
      },
      async remove(id) {
        await wait(200);
        db[key] = db[key].filter((x) => x.id !== id);
        return null;
      },
    },
  };
}

const today = () => todayIST();
const offers = makeCrud("offers", {
  label: "offer",
  publicFilter: (o) => o.isPublished && (!o.startDate || o.startDate <= today()) && (!o.endDate || o.endDate >= today()),
});
const gallery = makeCrud("gallery", { label: "gal", publicFilter: (g) => g.isPublished });
const attractions = makeCrud("attractions", { label: "att", publicFilter: (a) => a.isPublished });
attractions.detail = async (slug) => {
  await wait();
  const a = db.attractions.find((x) => x.slug === slug && x.isPublished);
  if (!a) throw notFound();
  return clone(a);
};
const tariffs = makeCrud("tariffs", { label: "tar" });

const reviews = {
  async publicList() {
    await wait();
    return clone(db.reviews.filter((r) => r.status === "approved"));
  },
  async submit(data) {
    await wait(400);
    if (data.website) return null;
    db.reviews.unshift({ id: uid("rev"), ...data, status: "pending", createdAt: new Date().toISOString() });
    return { received: true };
  },
  admin: {
    async list(params = {}) {
      await wait();
      let items = db.reviews.filter((r) => textMatch(r, params.q));
      if (params.status) items = items.filter((r) => r.status === params.status);
      return paginate(sortBy(items, params.sort || "createdAt", params.dir || "desc"), params);
    },
    async moderate(id, status) {
      await wait(200);
      const r = db.reviews.find((x) => x.id === id);
      if (!r) throw notFound();
      r.status = status;
      return clone(r);
    },
  },
};

// --- content ---------------------------------------------------------------
const content = {
  async get() {
    await wait();
    return clone(db.content);
  },
  admin: {
    async get() {
      await wait();
      return clone(db.content);
    },
    async update(data) {
      await wait(250);
      db.content = { ...db.content, ...clone(data) };
      return clone(db.content);
    },
    async publish() {
      await wait(300);
      return { published: true, at: new Date().toISOString() };
    },
  },
};

// --- reports ---------------------------------------------------------------
const reports = {
  async dashboard() {
    await wait();
    const t = todayIST();
    const count = (s) => db.bookings.filter((b) => b.status === s).length;
    return {
      date: t,
      timeZone: "Asia/Kolkata",
      todayBookings: db.bookings.filter((b) => b.createdAt.slice(0, 10) === t).length,
      arrivalsToday: db.bookings.filter((b) => b.checkIn === t).length,
      pending: count("pending"),
      confirmed: count("confirmed"),
      checkedIn: count("checked_in"),
      checkedOut: count("checked_out"),
      cancelled: count("cancelled"),
      occupancyPercent: null, // not reliable in mock mode
      todayEnquiries: db.enquiries.filter((e) => e.createdAt.slice(0, 10) === t).length,
      newEnquiries: db.enquiries.filter((e) => e.status === "new").length,
      month: {
        bookings: db.bookings.length,
        revenue: db.bookings.reduce((n, b) => n + (b.amountPaid || 0), 0),
      },
      daily: [],
    };
  },
  async daily({ from, to }) {
    await wait();
    const rows = {};
    db.bookings.forEach((b) => {
      const d = b.createdAt.slice(0, 10);
      if ((from && d < from) || (to && d > to)) return;
      rows[d] ||= { date: d, bookings: 0, confirmed: 0, cancelled: 0, revenue: 0 };
      rows[d].bookings += 1;
      if (b.status === "cancelled") rows[d].cancelled += 1;
      else if (b.status !== "pending") rows[d].confirmed += 1;
      rows[d].revenue += b.amountPaid || 0;
    });
    return { from, to, timeZone: "Asia/Kolkata", rows: Object.values(rows).sort((a, b) => (a.date < b.date ? -1 : 1)) };
  },
  async monthly({ from, to }) {
    const daily = await reports.daily({ from, to });
    const rows = {};
    daily.rows.forEach((r) => {
      const m = r.date.slice(0, 7);
      rows[m] ||= { month: m, bookings: 0, confirmed: 0, cancelled: 0, revenue: 0 };
      ["bookings", "confirmed", "cancelled", "revenue"].forEach((k) => (rows[m][k] += r[k]));
    });
    return { from, to, timeZone: "Asia/Kolkata", rows: Object.values(rows) };
  },
  async occupancy({ from, to }) {
    await wait();
    return { from, to, timeZone: "Asia/Kolkata", rows: [] };
  },
  async enquiries({ from, to }) {
    await wait();
    const rows = {};
    db.enquiries.forEach((e) => {
      const d = e.createdAt.slice(0, 10);
      if ((from && d < from) || (to && d > to)) return;
      rows[d] ||= { date: d, total: 0, resolved: 0 };
      rows[d].total += 1;
      if (e.status === "resolved") rows[d].resolved += 1;
    });
    return { from, to, timeZone: "Asia/Kolkata", rows: Object.values(rows) };
  },
  async export({ type, from, to }) {
    await wait(300);
    const csv = `type,from,to\n${type},${from || ""},${to || ""}\n# MOCK EXPORT - sample data only\n`;
    return { blob: new Blob([csv], { type: "text/csv" }), filename: `mock-${type}-export.csv` };
  },
};

const staff = {
  async list() {
    await wait();
    return clone(db.staff);
  },
  async create(data) {
    await wait();
    const u = { id: uid("u"), isActive: true, ...data };
    delete u.password;
    db.staff.push(u);
    return clone(u);
  },
  async update(id, patch) {
    await wait();
    const u = db.staff.find((x) => x.id === id);
    if (!u) throw notFound();
    Object.assign(u, patch);
    delete u.password;
    return clone(u);
  },
};

const upload = {
  async image(file) {
    await wait(400);
    return { url: "/placeholders/gallery.svg", name: file?.name || "image" };
  },
};

export const mock = {
  auth,
  rooms,
  bookings,
  payments,
  guests,
  enquiries,
  offers,
  gallery,
  attractions,
  tariffs,
  reviews,
  content,
  reports,
  staff,
  upload,
  ALLOWED_TRANSITIONS: ALLOWED,
};
