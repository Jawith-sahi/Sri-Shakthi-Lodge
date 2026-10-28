import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getMock, isMockApi } from "@/lib/api/helpers";

// Payments are never cached and never trusted from the browser:
// the browser only forwards what Razorpay returned; the BACKEND verifies the signature.

/**
 * Asks the backend to create a Razorpay order for a booking.
 * @returns {{orderId:string, amount:number /*paise*\/, currency:string, keyId?:string, bookingReference:string, name?:string, description?:string, prefill?:object}}
 */
export async function createPaymentOrder({ bookingReference, token }, idempotencyKey) {
  if (isMockApi()) return (await getMock()).payments.createOrder({ bookingReference, token });
  return apiRequest(endpoints.payments.createOrder, {
    method: "POST",
    body: { bookingReference, token },
    auth: false,
    idempotencyKey,
  });
}

/**
 * Sends the identifiers returned by Razorpay Checkout to the backend for SERVER-SIDE signature verification.
 * @returns {{verified:boolean, bookingStatus:string, paymentStatus:string, amountPaid?:number}}
 */
export async function verifyPayment(payload) {
  if (isMockApi()) return (await getMock()).payments.verify(payload);
  return apiRequest(endpoints.payments.verify, { method: "POST", body: payload, auth: false });
}

/** Re-checks status (e.g. after an interrupted payment or a page reload). */
export async function getPaymentStatus({ bookingReference, token }, { signal } = {}) {
  if (isMockApi()) return (await getMock()).payments.status({ bookingReference, token });
  return apiRequest(endpoints.payments.status, { query: { bookingReference, token }, auth: false, signal });
}
