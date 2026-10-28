// UX-only hint cookie. It is NOT the credential and proves nothing: the real session lives in the
// .NET API's httpOnly cookie (or token) and the backend authorises every request.
// The Next proxy uses the hint only to send signed-out visitors to the login page quickly.
export const ADMIN_HINT_COOKIE = "sl_admin_session";

export const ROLES = {
  owner: "owner",
  staff: "staff",
};
