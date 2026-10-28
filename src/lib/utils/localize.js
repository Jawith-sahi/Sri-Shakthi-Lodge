// API content may be a plain string or { en, ta }. Falls back to English, then to any available value.
export function pick(value, locale = "en") {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return value[locale] || value.en || Object.values(value).find(Boolean) || "";
  }
  return String(value);
}

export function hasText(value) {
  return Boolean(pick(value, "en") || pick(value, "ta"));
}
