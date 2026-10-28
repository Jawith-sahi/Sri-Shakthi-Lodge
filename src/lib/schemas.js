import { z } from "zod";
import { lodge } from "@/config/lodge";
import { nightsBetween, todayIST } from "@/lib/utils/format";

// All error messages are TRANSLATION KEYS (namespace "validation"); <FieldError/> translates them.

/** Strips spaces, dashes, "+91" and a leading 0 so "72000 74204" and "+91 7200074204" both work. */
export function normalizePhone(value) {
  if (typeof value !== "string") return value;
  let digits = value.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return digits;
}

const requiredText = (min = 1, max = 120) =>
  z
    .string("validation.required")
    .trim()
    .min(min, min > 1 ? "validation.tooShort" : "validation.required")
    .max(max, "validation.tooLong");

const optionalText = (max = 500) => z.string().trim().max(max, "validation.tooLong").optional().or(z.literal(""));

export const phoneSchema = z.preprocess(
  normalizePhone,
  z.string("validation.required").min(1, "validation.required").regex(/^[6-9]\d{9}$/, "validation.phone")
);

export const emailSchema = z.string().trim().email("validation.email");
export const optionalEmailSchema = z.union([z.literal(""), emailSchema]).optional();

const isoDate = z
  .string("validation.required")
  .min(1, "validation.required")
  .regex(/^\d{4}-\d{2}-\d{2}$/, "validation.date");

const intField = (min, max, key = "validation.number") =>
  z.coerce.number(key).int(key).min(min, key).max(max, key);

// ---------------------------------------------------------------------
// Booking search (also used by the home hero + room widget)
// ---------------------------------------------------------------------
export const searchSchema = z
  .object({
    checkIn: isoDate,
    checkOut: isoDate,
    adults: intField(1, lodge.limits.maxAdults),
    children: intField(0, lodge.limits.maxChildren),
    rooms: intField(1, lodge.limits.maxRooms),
    category: z.enum(["", "ac", "non-ac"]).optional(),
  })
  .superRefine((v, ctx) => {
    if (v.checkIn && v.checkIn < todayIST()) {
      ctx.addIssue({ code: "custom", path: ["checkIn"], message: "validation.pastDate" });
    }
    if (v.checkIn && v.checkOut && v.checkOut <= v.checkIn) {
      ctx.addIssue({ code: "custom", path: ["checkOut"], message: "validation.checkoutAfterCheckin" });
    } else if (nightsBetween(v.checkIn, v.checkOut) > lodge.limits.maxNights) {
      ctx.addIssue({ code: "custom", path: ["checkOut"], message: "validation.tooManyNights" });
    }
  });

// ---------------------------------------------------------------------
// Guest details (booking step 3)
// ---------------------------------------------------------------------
export const guestSchema = z.object({
  name: requiredText(2, 100),
  phone: phoneSchema,
  email: optionalEmailSchema,
  arrivalTime: optionalText(40),
  notes: optionalText(500),
  paymentMethod: z.enum(["online", "payAtHotel"]),
  acceptPolicies: z.literal(true, "validation.acceptRequired"),
});

// ---------------------------------------------------------------------
// Contact form (public)
// ---------------------------------------------------------------------
export const contactSchema = z.object({
  name: requiredText(2, 100),
  phone: phoneSchema,
  email: optionalEmailSchema,
  subject: requiredText(3, 150),
  message: requiredText(10, 1500),
  // Honeypot: real visitors never see/fill this. The backend must ignore submissions where it is non-empty.
  website: z.string().max(0).optional().or(z.literal("")),
});

export const reviewSchema = z.object({
  name: requiredText(2, 80),
  rating: intField(1, 5, "validation.rating"),
  text: requiredText(10, 600),
  website: z.string().max(0).optional().or(z.literal("")),
});

export const lookupSchema = z.object({
  reference: requiredText(4, 40),
  phone: phoneSchema,
});

export const cancelSchema = z.object({
  reason: optionalText(300),
  accountHolder: optionalText(100),
  accountNumber: z.union([z.literal(""), z.string().trim().regex(/^\d{6,20}$/, "validation.accountNumber")]).optional(),
  ifsc: z.union([z.literal(""), z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "validation.ifsc")]).optional(),
  confirm: z.literal(true, "validation.acceptRequired"),
});

// ---------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------
export const loginSchema = z.object({
  username: z.string("validation.required").trim().min(1, "validation.required"),
  password: z.string("validation.required").min(1, "validation.required"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "validation.required"),
    newPassword: z.string().min(8, "validation.passwordShort"),
    confirmPassword: z.string().min(1, "validation.required"),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "validation.passwordMismatch",
  });

export const walkInSchema = z
  .object({
    roomId: z.string().min(1, "validation.required"),
    checkIn: isoDate,
    checkOut: isoDate,
    adults: intField(1, lodge.limits.maxAdults),
    children: intField(0, lodge.limits.maxChildren),
    rooms: intField(1, lodge.limits.maxRooms),
    name: requiredText(2, 100),
    phone: phoneSchema,
    email: optionalEmailSchema,
    notes: optionalText(500),
  })
  .refine((v) => v.checkOut > v.checkIn, { path: ["checkOut"], message: "validation.checkoutAfterCheckin" });

export const blockedDateSchema = z
  .object({ from: isoDate, to: isoDate, reason: optionalText(200) })
  .refine((v) => v.to >= v.from, { path: ["to"], message: "validation.dateOrder" });

export const staffSchema = z.object({
  name: requiredText(2, 100),
  username: requiredText(3, 50),
  role: z.enum(["owner", "staff"]),
  password: z.string().min(8, "validation.passwordShort"),
});
