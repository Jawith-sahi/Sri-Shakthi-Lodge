import { env } from "@/config/environment";
import { razorpayAdapter } from "@/lib/payments/razorpayAdapter";
import { mockPaymentAdapter } from "@/lib/payments/mockPaymentAdapter";

/** Real Razorpay everywhere except local mock mode. */
export function getPaymentAdapter() {
  return env.useMock ? mockPaymentAdapter : razorpayAdapter;
}
