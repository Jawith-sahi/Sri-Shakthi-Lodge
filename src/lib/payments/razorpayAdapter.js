// Razorpay Checkout adapter.
//  - The checkout.js script is loaded ONLY when the guest reaches the payment step and presses "Pay".
//  - Only the PUBLIC key id is used here (from the backend's order response, or NEXT_PUBLIC_RAZORPAY_KEY_ID).
//  - A successful browser callback is NOT proof of payment: the caller must send the ids to the backend,
//    which verifies the signature with the key secret. Show "confirmed" only when the backend says so.

import { env } from "@/config/environment";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
let scriptPromise = null;

function loadScript() {
  if (typeof window === "undefined") return Promise.reject(new Error("no-window"));
  if (window.Razorpay) return Promise.resolve();
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    const el = document.createElement("script");
    el.src = SCRIPT_SRC;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => {
      scriptPromise = null; // allow a retry after a network failure
      el.remove();
      reject(new Error("script-load-failed"));
    };
    document.body.appendChild(el);
  });
  return scriptPromise;
}

export const razorpayAdapter = {
  kind: "razorpay",

  /**
   * @param {object} order  response of POST /payments/orders
   * @returns {Promise<{outcome:"success",razorpayOrderId:string,razorpayPaymentId:string,razorpaySignature:string}
   *   | {outcome:"cancelled"} | {outcome:"failed", reason:string}>}
   */
  async pay(order) {
    const key = order.keyId || env.razorpayKeyId;
    if (!key) return { outcome: "failed", reason: "missing-key" };

    try {
      await loadScript();
    } catch {
      return { outcome: "failed", reason: "script-load-failed" };
    }

    return new Promise((resolve) => {
      let settled = false;
      const done = (result) => {
        if (settled) return;
        settled = true;
        resolve(result);
      };

      const instance = new window.Razorpay({
        key,
        amount: order.amount, // paise, decided by the backend
        currency: order.currency || "INR",
        name: order.name || "Sri Sakthi Lodge",
        description: order.description || "",
        order_id: order.orderId,
        prefill: order.prefill || {},
        theme: { color: "#0B2A5B" },
        modal: {
          // Closed without paying. (If the payment actually went through, the status re-check will find out.)
          ondismiss: () => done({ outcome: "cancelled" }),
        },
        handler: (response) =>
          done({
            outcome: "success",
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          }),
      });

      instance.on("payment.failed", (response) =>
        done({ outcome: "failed", reason: response?.error?.description || "payment-failed" })
      );
      instance.open();
    });
  },
};
