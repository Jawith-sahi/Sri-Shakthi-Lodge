// =====================================================================
// DEV-ONLY MOCK PAYMENT ADAPTER. No money moves. Never used in production
// (payments/index.js only returns it when NEXT_PUBLIC_USE_MOCK=true, which a production build rejects).
// The payment step shows a clearly labelled panel with "simulate" buttons.
// =====================================================================

export const mockPaymentAdapter = {
  kind: "mock",

  /** @param {"success"|"failed"|"cancelled"} simulate */
  async pay(order, simulate = "success") {
    await new Promise((r) => setTimeout(r, 400));
    if (simulate === "cancelled") return { outcome: "cancelled" };
    if (simulate === "failed") return { outcome: "failed", reason: "MOCK: simulated payment failure" };
    return {
      outcome: "success",
      razorpayOrderId: order.orderId,
      razorpayPaymentId: `mock_pay_${Math.random().toString(36).slice(2, 10)}`,
      razorpaySignature: "mock_signature",
    };
  },
};
