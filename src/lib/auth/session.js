import { ADMIN_HINT_COOKIE } from "@/constants/auth";

// UX-only hint so the Next proxy can send signed-out visitors to the login page without a flash.
// It holds NO credential and grants nothing: every admin API call is authorised by the .NET backend.

export function setAdminHint() {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_HINT_COOKIE}=1; path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}; max-age=${60 * 60 * 12}`;
}

export function clearAdminHint() {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_HINT_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
