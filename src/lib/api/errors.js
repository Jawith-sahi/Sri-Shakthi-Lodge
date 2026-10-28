// Turns an ApiError into text a human should see.
//  - customers: translated, friendly, no internals (backend text only for conflict/validation)
//  - staff:     backend message when present

export function getErrorMessage(error, t) {
  if (!error) return "";
  const code = error.code || "unknown";
  if ((code === "conflict" || code === "validation") && error.serverMessage) {
    return error.serverMessage;
  }
  if (typeof t === "function") {
    try {
      const translated = t(`errors.${code}`);
      if (translated && !translated.startsWith("errors.")) return translated;
    } catch {
      /* fall through */
    }
  }
  return error.message || "Something went wrong. Please try again.";
}

export function getAdminErrorMessage(error) {
  if (!error) return "";
  return error.serverMessage || error.message || "Something went wrong. Please try again.";
}
