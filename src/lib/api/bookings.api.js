import { apiRequest, toPaged } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getMock, isMockApi } from "@/lib/api/helpers";

// All booking calls are uncached (`cache: "no-store"` is the client default for non-public requests).

/**
 * Creates a booking on the backend. The backend recalculates price/availability and answers with the
 * authoritative amounts. `idempotencyKey` makes accidental double submits safe.
 */
export async function createBooking(payload, idempotencyKey) {
  if (isMockApi()) return (await getMock()).bookings.create(payload);
  return apiRequest(endpoints.bookings.create, {
    method: "POST",
    body: payload,
    auth: false,
    idempotencyKey,
  });
}

/** Read a booking with the short-lived access token returned by createBooking / lookup. */
export async function getPublicBooking(reference, token, { signal } = {}) {
  if (isMockApi()) return (await getMock()).bookings.publicGet(reference, token);
  return apiRequest(endpoints.bookings.publicGet(reference), { query: { token }, auth: false, signal });
}

/** Lookup = booking reference + phone number used when booking (agree the exact factor with the backend dev). */
export async function lookupBooking({ reference, phone }) {
  if (isMockApi()) return (await getMock()).bookings.lookup({ reference, phone });
  return apiRequest(endpoints.bookings.lookup, { method: "POST", body: { reference, phone }, auth: false });
}

/** Guest-initiated cancellation. Refund bank details (if any) go straight to the backend - never stored in the browser. */
export async function cancelBooking(reference, payload) {
  if (isMockApi()) return (await getMock()).bookings.cancel(reference, payload);
  return apiRequest(endpoints.bookings.cancel(reference), { method: "POST", body: payload, auth: false });
}

// ---------------- admin ----------------

export async function adminListBookings(params = {}) {
  if (isMockApi()) return (await getMock()).bookings.admin.list(params);
  return toPaged(await apiRequest(endpoints.bookings.admin.list, { query: params }), params);
}

export async function adminGetBooking(id) {
  if (isMockApi()) return (await getMock()).bookings.admin.detail(id);
  return apiRequest(endpoints.bookings.admin.detail(id));
}

/** Manual / walk-in booking created by staff. */
export async function adminCreateBooking(payload) {
  if (isMockApi()) return (await getMock()).bookings.admin.create(payload);
  return apiRequest(endpoints.bookings.admin.create, { method: "POST", body: payload });
}

/** The backend validates the transition and returns an error we show as-is. */
export async function adminUpdateBookingStatus(id, status) {
  if (isMockApi()) return (await getMock()).bookings.admin.updateStatus(id, status);
  return apiRequest(endpoints.bookings.admin.updateStatus(id), { method: "PATCH", body: { status } });
}

export async function adminCancelBooking(id, payload = {}) {
  if (isMockApi()) return (await getMock()).bookings.admin.cancel(id, payload);
  return apiRequest(endpoints.bookings.admin.cancel(id), { method: "POST", body: payload });
}
