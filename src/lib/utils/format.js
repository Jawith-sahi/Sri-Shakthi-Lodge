import { addDays, differenceInCalendarDays, format, isValid, parseISO } from "date-fns";

export const IST = "Asia/Kolkata";

/** Today's date in IST as yyyy-MM-dd (independent of the visitor's device time zone). */
export function todayIST() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: IST }).format(new Date());
}

export function tomorrowIST() {
  return toISODate(addDays(parseISO(todayIST()), 1));
}

export function toISODate(date) {
  return format(date, "yyyy-MM-dd");
}

export function addDaysISO(iso, days) {
  const d = parseISO(iso);
  return isValid(d) ? toISODate(addDays(d, days)) : "";
}

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const a = parseISO(checkIn);
  const b = parseISO(checkOut);
  if (!isValid(a) || !isValid(b)) return 0;
  return Math.max(0, differenceInCalendarDays(b, a));
}

const localeTag = (locale) => (locale === "ta" ? "ta-IN" : "en-IN");

/** Formats a yyyy-MM-dd (or ISO) date for display. Returns "" for invalid input. */
export function formatDate(value, locale = "en", options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!value) return "";
  const d = typeof value === "string" ? parseISO(value) : value;
  if (!isValid(d)) return "";
  return new Intl.DateTimeFormat(localeTag(locale), options).format(d);
}

/** Date + time in IST. */
export function formatDateTimeIST(value, locale = "en") {
  if (!value) return "";
  const d = new Date(value);
  if (!isValid(d)) return "";
  return new Intl.DateTimeFormat(localeTag(locale), {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: IST,
  }).format(d);
}

/** Indian rupees. Returns null when the value is not a usable number (so UI can show a fallback). */
export function formatINR(amount, locale = "en") {
  const n = typeof amount === "string" ? Number(amount) : amount;
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  return new Intl.NumberFormat(localeTag(locale), {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}

/** Masks a phone number for lists, e.g. 72•••••204. */
export function maskPhone(phone) {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length < 6) return phone;
  return `${digits.slice(0, 2)}${"•".repeat(digits.length - 5)}${digits.slice(-3)}`;
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}
