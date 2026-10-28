# Sri Sakthi Lodge – Frontend

Public website, booking flow and admin dashboard for **Sri Sakthi Lodge**, a budget lodge in Kanyakumari District, Tamil Nadu.

- Next.js 16 (App Router), React 19, **JavaScript only**
- Tailwind CSS v4, next-intl (English + Tamil), react-hook-form + zod, sonner, date-fns, lucide-react
- recharts is used **only** in the admin dashboard and is dynamically imported
- No backend lives here. A separate **ASP.NET Core** API is expected. Until it exists the app runs against an in-memory **mock** layer.

> ## Honest status
> | Checked | Result |
> |---|---|
> | `npm run lint` | 0 errors, 24 warnings (see "Lint notes") |
> | `npm run build` (mock off) | Passes, 63 static pages generated |
> | Every public and admin route requested against the dev server in mock mode | All respond; admin redirects to login without the hint cookie |
> | Visible text on key pages scanned for `undefined` / `NaN` / `[object` | None found |
> | **Not tested** | Real backend, real Razorpay payments, real browsers/devices, screen readers, Lighthouse scores, Tamil typography review by a native reader, automated tests (none written) |
>
> Nothing here has been verified against a real API. Treat the API contract below as a **proposal** until the .NET developer agrees it.

## Quick start

```bash
npm install
cp .env.example .env.local     # then edit
npm run dev                    # http://localhost:3000  (redirects to /en)
```

`.env.local` ships with `NEXT_PUBLIC_USE_MOCK=true` so the site works without a backend.

```bash
npm run lint
npm run build && npm start     # needs NEXT_PUBLIC_USE_MOCK unset/false
```

## Environment variables

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the .NET API (no trailing slash) |
| `NEXT_PUBLIC_USE_MOCK` | `true` = use the in-memory mock. **Production builds refuse to start/build with this on.** |
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL for metadata, sitemap and JSON-LD |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Public Razorpay key id (never put the secret here) |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Optional WhatsApp number (digits with country code) |
| `NEXT_PUBLIC_IMAGE_HOSTS` | Comma-separated hostnames allowed for remote images |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Optional Cloudflare Turnstile site key for public forms |
| `REVALIDATE_SECRET` | Shared secret for `POST /api/revalidate` (server only) |

## Mock mode

With `NEXT_PUBLIC_USE_MOCK=true`:
- A visible banner says the data is sample data. Sample records are labelled as samples and are never presented as real.
- Admin sign-in accepts **any non-empty username/password** (a username containing `staff` gets the staff role). This is for development only.
- Bookings are never shown as "confirmed" by the frontend itself. The status always comes from the (mock) backend.
- The mock advance-payment rule (25%) is a **placeholder**, not a lodge policy.

## Folder guide

```
src/
  app/(site)/[locale]/…   public pages (en/ta), root layout #1
  app/admin/…             admin dashboard (English only, no locale prefix), root layout #2
  app/api/revalidate/     cache purge endpoint
  app/sitemap.js, robots.js
  components/             ui/, layout/, booking/, rooms/, admin/, …
  config/lodge.js         ← single source of business facts (edit here)
  config/environment.js   env parsing + production mock guard
  lib/api/                one fetch client + one file per backend module
  lib/api/endpoints.js    ← every backend path (edit here when the contract changes)
  lib/mock/               in-memory mock backend
  lib/payments/           Razorpay adapter + dev-only mock adapter
  messages/en.json, ta.json
  proxy.js                admin gate + next-intl (Next 16 name for middleware)
```

## Editing business facts

All hotel facts live in **`src/config/lodge.js`**. Anything not confirmed by the client is marked `TODO(verify)` and `verified: false`, and the UI hides it (for example an unconfirmed PIN code, an incomplete phone number, or an unconfirmed Maps link). When the client confirms a value, change it and set `verified: true`.

The frontend never invents prices, room sizes, occupancy, amenities, distances, opening hours, coordinates, reviews, ratings, offers, taxes, fees or refund percentages. Prices come from the API only.

## Adding a language

1. Add the locale to `src/constants/locales.js` and `src/i18n/routing.js`.
2. Copy `src/messages/en.json` to `src/messages/<code>.json` and translate. Keep the keys identical.
3. Add a font if the script needs one in `src/lib/fonts.js`.

## Caching and revalidation

- Public GETs use `next: { revalidate: 300, tags }`. Availability, bookings, payments and all admin calls are `no-store`.
- After an admin saves rooms, offers, gallery, attractions, reviews or content, the frontend calls `POST /api/revalidate` with the affected tags so the public site updates immediately.
- The backend may also call it with header `x-revalidate-secret: $REVALIDATE_SECRET`.

## Deploying

Any Node host or Vercel. Set the environment variables above, make sure `NEXT_PUBLIC_USE_MOCK` is **not** `true`, then `npm run build && npm start`.

## Connecting the real backend

1. Agree the contract below with the .NET developer and edit `src/lib/api/endpoints.js` if paths differ.
2. Set `NEXT_PUBLIC_API_BASE_URL`, set `NEXT_PUBLIC_USE_MOCK=false`.
3. Configure CORS on the API for the site origin, with credentials allowed (the admin uses cookies).
4. Check response shapes against `src/lib/mock/seed.js` and the JSDoc in `src/lib/api/*.api.js`. Lists are expected as `{ items, page, pageSize, totalCount }` (a bare array is also tolerated).
5. Admin authentication: the backend sets an **HttpOnly, Secure, SameSite** session cookie. The frontend also sets a non-sensitive `sl_admin_session` hint cookie, used **only** to avoid a flash of the admin UI. It grants no access.

## API contract (proposed)

All paths are prefixed `/api/v1`. Errors should be JSON `{ code, message, fieldErrors? }`. Dates are `yyyy-MM-dd`, timestamps ISO-8601 UTC, and business days are in `Asia/Kolkata`. Money is in INR, calculated **by the server only**.

### Public

| Endpoint | Method | Request | Response | Auth | Notable errors |
|---|---|---|---|---|---|
| `/rooms` | GET | – | Room[] | none | – |
| `/rooms/{slug}` | GET | – | Room | none | 404 |
| `/rooms/availability` | GET | `checkIn, checkOut, adults, children?, rooms?, category?` | Available rooms with server-computed price, nights, taxes if any | none | 422 invalid dates, 409 none available |
| `/bookings` | POST | guest + room + dates; header `Idempotency-Key` | Booking `{ reference, token, status, amountDue, advanceAmount, paymentMethod, canPay }` | none | 409 unavailable, 422, 429 |
| `/bookings/public/{reference}?token=` | GET | – | Public booking view | booking token | 404, 403 |
| `/bookings/lookup` | POST | `{ reference, phone }` | Public booking view | none | 404, 429 |
| `/bookings/{reference}/cancel` | POST | `{ token, reason? }` | Booking incl. server-calculated refund, if any | booking token | 409 not cancellable |
| `/payments/orders` | POST | `{ bookingReference, token }` | Razorpay `{ orderId, amount, currency, keyId }` | booking token | 409, 422 |
| `/payments/verify` | POST | Razorpay `{ orderId, paymentId, signature }` | `{ status }` | booking token | 400 bad signature |
| `/payments/status` | GET | `bookingReference, token` | `{ status }` | booking token | 404 |
| `/enquiries` | POST | `{ name, phone, email?, subject?, message, captchaToken? }` | `{ id }` | none | 422, 429 |
| `/reviews` | GET / POST | POST: `{ name, rating, comment, captchaToken? }` | GET approved only; POST saved as `pending` | none | 422, 429 |
| `/offers` | GET | – | Published and currently valid offers | none | – |
| `/gallery` | GET | – | Published items | none | – |
| `/attractions`, `/attractions/{slug}` | GET | – | Published attractions | none | 404 |
| `/content` | GET | – | Published CMS content | none | – |

### Admin (all require an authenticated staff or owner session)

| Endpoint | Method | Purpose |
|---|---|---|
| `/auth/login`, `/auth/logout`, `/auth/me`, `/auth/refresh`, `/auth/change-password` | POST / GET | Session. Login must be rate limited and lock out repeated failures |
| `/admin/rooms` (+ `/{id}`, `/{id}/active`, `/{id}/images`, `/{id}/images/{imageId}`, `/{id}/images/order`) | GET / POST / PUT / PATCH / DELETE | Room CRUD, images (multipart) |
| `/admin/rooms/{id}/blocked-dates` (+ `/{blockId}`) | GET / POST / DELETE | Blocked dates |
| `/admin/bookings` (+ `/{id}`, `/{id}/status`, `/{id}/cancel`, `/export`) | GET / POST / PATCH | List, walk-in create, **allowed status transitions enforced by the server**, export |
| `/admin/guests` (+ `/{id}`) | GET | Guest list/detail |
| `/admin/enquiries` (+ `/{id}`) | GET / PATCH | Status and notes |
| `/admin/tariffs` (+ `/{id}`) | GET / POST / PUT / DELETE | Base rates and seasonal rates |
| `/admin/offers`, `/admin/gallery`, `/admin/attractions` (+ `/{id}`) | GET / POST / PUT / DELETE | CRUD |
| `/admin/uploads` | POST (multipart) | Image upload → `{ url }` |
| `/admin/reviews` (+ `/{id}/status`) | GET / PATCH | Approve / reject |
| `/admin/content` | GET / PUT | Draft CMS content |
| `/admin/content/publish` | POST | Publish the draft |
| `/admin/reports/dashboard-summary`, `/daily`, `/monthly`, `/occupancy`, `/enquiries` | GET `from, to` | Aggregates computed server-side |
| `/admin/reports/export` | GET `type, from, to, format=csv\|xlsx` | Streamed file |
| `/admin/staff` (+ `/{id}`) | GET / POST / PATCH | **Owner only** |

The booking confirmation page reads `ref` and `token` from the URL query (`/booking/success?ref=…&token=…`). Use a long, random, single-booking token, and keep it out of logs and analytics.

## Backend security requirements (for the .NET developer)

The frontend hides or disables things for usability only. **None of it is a security boundary.** The API must enforce:

1. **Authentication and authorization** on every `/admin/*` route; owner-only on `/admin/staff`; role checks per action, not per screen.
2. **Session cookies**: HttpOnly, Secure, SameSite; short-lived access plus rotating refresh; CSRF protection for cookie-authenticated writes.
3. **Server-side validation** of every field (the zod schemas are UX only), including length limits and date logic.
4. **Server-side pricing and availability**; ignore any price or total sent by the client.
5. **Booking state machine**: only allowed status transitions; a booking becomes "confirmed" only from a verified payment or an explicit staff action.
6. **Razorpay**: create the order server-side, **verify the payment signature server-side**, and handle webhooks idempotently. Never trust the browser's "payment succeeded".
7. **Idempotency**: honour the `Idempotency-Key` header on booking creation.
8. **Rate limiting** on login, booking, lookup, enquiries and reviews; lockout after repeated failed logins.
9. **Bot protection**: verify the honeypot field and the Turnstile token server-side if enabled.
10. **CORS**: allow only the site origin; no wildcard with credentials.
11. **Uploads**: check type by content (not extension), size limits, re-encode images, random file names, no executable content.
12. **Booking token / lookup**: unguessable tokens, limited exposure of personal data (mask phone numbers), no enumeration through error messages.
13. **PII handling**: guest phone, email and ID data are personal data; restrict access, log admin access, define retention.
14. **Security headers and HTTPS** at the API as well, and no secrets in the frontend.

## Open questions for the client

1. **PIN code**: 625203 does not look right for Kanyakumari District (these usually start with 629). What is the correct PIN?
2. **Phone numbers**: one is written "94893 5545?" and is incomplete. Which numbers should be public? Which is for calls and which for WhatsApp?
3. **Email address**: is there an official one?
4. **Google Maps link** and exact location (nothing approximate is shown as exact).
5. **Check-out time**: the notes say both 12:00 noon and 11:00 AM.
6. **Number of rooms**: the categories add up to 21 but the notes say 17. No total is shown until this is settled.
7. **Breakfast** (8:00–10:00 AM): does it apply to all bookings?
8. **Refunds**: the 7-day window is known, but the percentages and conditions are not. None are shown.
9. **Advance payment**: the real amount or percentage and when it is due.
10. **Taxes or fees**: are any charged? Nothing is shown until confirmed.
11. **Real photos and room details** (sizes, occupancy, amenities per room). Placeholders are used meanwhile.
12. **Policy wording** for cancellation, terms and privacy, approved by the owner (and ideally a lawyer).

## Lint notes

`npm run lint` reports **0 errors**. Three React-Compiler-era rules are set to *warn* in `eslint.config.mjs` (`set-state-in-effect`, `purity`, `refs`). They flag the standard "set loading, then fetch" effect and `Date.now()` inside submit handlers, which is deliberate in this code. There are also a few "incompatible library" warnings from react-hook-form's `watch`. Revisit them if you adopt the React Compiler.

## Known limitations

- Unknown URLs render the not-found page (with `noindex`) but the HTTP status is **200**, because route-level `loading.js` streams the shell before the not-found is known. Remove `loading.js` for the affected routes if a true 404 status matters for SEO.
- The admin guard is UX-only (see above).
- Mock mode is development-only.
#   s r i - s a k t h i - l o d g e  
 