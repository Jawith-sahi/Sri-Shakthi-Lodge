// Central, validated access to environment variables.
// NOTE: NEXT_PUBLIC_* values are inlined at build time, so each one must be referenced literally.

const isProduction = process.env.NODE_ENV === "production";

export const env = {
  isProduction,
  apiBaseUrl: (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/+$/, ""),
  useMock: process.env.NEXT_PUBLIC_USE_MOCK === "true",
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, ""),
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, ""),
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
  imageHosts: (process.env.NEXT_PUBLIC_IMAGE_HOSTS || "")
    .split(",")
    .map((h) => h.trim())
    .filter(Boolean),
};

// Safety net: mock data must never reach a production build.
if (isProduction && env.useMock) {
  throw new Error(
    "NEXT_PUBLIC_USE_MOCK=true is not allowed in a production build. " +
      "Remove it (or set it to false) and configure NEXT_PUBLIC_API_BASE_URL."
  );
}

/** True when real data can be requested (a backend URL is configured, or mock mode is on in development). */
export const isApiConfigured = env.useMock || Boolean(env.apiBaseUrl);
