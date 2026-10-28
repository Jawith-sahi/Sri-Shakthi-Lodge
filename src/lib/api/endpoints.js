// =====================================================================
// EVERY backend path lives here. Components must never contain raw URLs.
//
// ASSUMPTION: the final .NET routes are not agreed yet. These paths are a proposal;
// change them here (one file) when the real contract arrives. See README -> "API contract".
// =====================================================================

export const API_PREFIX = "/api/v1";
const p = (path) => `${API_PREFIX}${path}`;
const enc = encodeURIComponent;

export const endpoints = {
  // ---- Auth (staff) ----
  auth: {
    login: p("/auth/login"),
    logout: p("/auth/logout"),
    me: p("/auth/me"),
    refresh: p("/auth/refresh"),
    changePassword: p("/auth/change-password"),
  },

  // ---- Rooms ----
  rooms: {
    list: p("/rooms"), // public
    detail: (slug) => p(`/rooms/${enc(slug)}`), // public
    availability: p("/rooms/availability"), // public, never cached
    admin: {
      list: p("/admin/rooms"),
      detail: (id) => p(`/admin/rooms/${enc(id)}`),
      create: p("/admin/rooms"),
      update: (id) => p(`/admin/rooms/${enc(id)}`),
      setActive: (id) => p(`/admin/rooms/${enc(id)}/active`),
      remove: (id) => p(`/admin/rooms/${enc(id)}`),
      images: (id) => p(`/admin/rooms/${enc(id)}/images`), // POST multipart
      image: (id, imageId) => p(`/admin/rooms/${enc(id)}/images/${enc(imageId)}`), // DELETE
      reorderImages: (id) => p(`/admin/rooms/${enc(id)}/images/order`), // PUT
      blockedDates: (id) => p(`/admin/rooms/${enc(id)}/blocked-dates`), // GET/POST
      blockedDate: (id, blockId) => p(`/admin/rooms/${enc(id)}/blocked-dates/${enc(blockId)}`), // DELETE
    },
  },

  // ---- Bookings ----
  bookings: {
    create: p("/bookings"), // public, POST (Idempotency-Key header)
    publicGet: (reference) => p(`/bookings/public/${enc(reference)}`), // + ?token=
    lookup: p("/bookings/lookup"), // POST { reference, phone }
    cancel: (reference) => p(`/bookings/${enc(reference)}/cancel`), // POST
    admin: {
      list: p("/admin/bookings"),
      detail: (id) => p(`/admin/bookings/${enc(id)}`),
      create: p("/admin/bookings"), // walk-in / manual
      updateStatus: (id) => p(`/admin/bookings/${enc(id)}/status`),
      cancel: (id) => p(`/admin/bookings/${enc(id)}/cancel`),
      export: p("/admin/bookings/export"),
    },
  },

  // ---- Payments ----
  payments: {
    createOrder: p("/payments/orders"), // POST { bookingReference } -> Razorpay order details
    verify: p("/payments/verify"), // POST razorpay ids -> server-side signature check
    status: p("/payments/status"), // GET ?bookingReference=&token=
  },

  // ---- Guests (admin) ----
  guests: {
    list: p("/admin/guests"),
    detail: (id) => p(`/admin/guests/${enc(id)}`),
  },

  // ---- Enquiries ----
  enquiries: {
    submit: p("/enquiries"), // public
    admin: {
      list: p("/admin/enquiries"),
      detail: (id) => p(`/admin/enquiries/${enc(id)}`),
      update: (id) => p(`/admin/enquiries/${enc(id)}`), // PATCH status / notes
    },
  },

  // ---- Tariffs (admin) ----
  tariffs: {
    list: p("/admin/tariffs"),
    create: p("/admin/tariffs"),
    update: (id) => p(`/admin/tariffs/${enc(id)}`),
    remove: (id) => p(`/admin/tariffs/${enc(id)}`),
  },

  // ---- Offers ----
  offers: {
    list: p("/offers"), // public: published + currently valid only
    admin: {
      list: p("/admin/offers"),
      create: p("/admin/offers"),
      update: (id) => p(`/admin/offers/${enc(id)}`),
      remove: (id) => p(`/admin/offers/${enc(id)}`),
    },
  },

  // ---- Gallery ----
  gallery: {
    list: p("/gallery"), // public: published only
    admin: {
      list: p("/admin/gallery"),
      create: p("/admin/gallery"), // multipart or JSON (video link)
      update: (id) => p(`/admin/gallery/${enc(id)}`),
      remove: (id) => p(`/admin/gallery/${enc(id)}`),
      upload: p("/admin/uploads"), // generic image upload -> { url }
    },
  },

  // ---- Reviews ----
  reviews: {
    list: p("/reviews"), // public: approved only
    submit: p("/reviews"), // POST: lands as "pending"
    admin: {
      list: p("/admin/reviews"),
      moderate: (id) => p(`/admin/reviews/${enc(id)}/status`),
    },
  },

  // ---- Attractions ----
  attractions: {
    list: p("/attractions"),
    detail: (slug) => p(`/attractions/${enc(slug)}`),
    admin: {
      list: p("/admin/attractions"),
      create: p("/admin/attractions"),
      update: (id) => p(`/admin/attractions/${enc(id)}`),
      remove: (id) => p(`/admin/attractions/${enc(id)}`),
    },
  },

  // ---- Content / CMS ----
  content: {
    get: p("/content"), // public
    admin: {
      get: p("/admin/content"),
      update: p("/admin/content"), // PUT draft
      publish: p("/admin/content/publish"), // POST
    },
  },

  // ---- Reports (admin) ----
  reports: {
    dashboard: p("/admin/reports/dashboard-summary"),
    daily: p("/admin/reports/daily"),
    monthly: p("/admin/reports/monthly"),
    occupancy: p("/admin/reports/occupancy"),
    enquiries: p("/admin/reports/enquiries"),
    export: p("/admin/reports/export"),
  },

  // ---- Staff management (owner) ----
  staff: {
    list: p("/admin/staff"),
    create: p("/admin/staff"),
    update: (id) => p(`/admin/staff/${enc(id)}`),
  },
};

// Same-origin Next.js route handler used to purge cached public pages after admin changes.
export const REVALIDATE_ROUTE = "/api/revalidate";
