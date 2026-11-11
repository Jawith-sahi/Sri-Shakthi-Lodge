import { apiRequest, setAccessToken, clearAccessToken } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getMock, isMockApi } from "@/lib/api/helpers";

/** @returns {Promise<{id:string,name:string,username:string,role:"owner"|"staff"}>} */
export async function login({ username, password }) {
  if (isMockApi()) return (await getMock()).auth.login({ username, password });
  const result = await apiRequest(endpoints.auth.login, { method: "POST", body: { username, password } });
  if (result?.accessToken || result?.token) {
    setAccessToken(result.accessToken || result.token);
  }
  return result;
}

export async function logout() {
  clearAccessToken();
  if (isMockApi()) return (await getMock()).auth.logout();
  return apiRequest(endpoints.auth.logout, { method: "POST" });
}

export async function getCurrentUser(signal) {
  if (isMockApi()) return (await getMock()).auth.me();
  return apiRequest(endpoints.auth.me, { signal });
}

export async function refreshSession() {
  if (isMockApi()) return null;
  const result = await apiRequest(endpoints.auth.refresh, { method: "POST" });
  if (result?.accessToken || result?.token) {
    setAccessToken(result.accessToken || result.token);
  }
  return result;
}

export async function changePassword({ currentPassword, newPassword }) {
  if (isMockApi()) return (await getMock()).auth.changePassword({ currentPassword, newPassword });
  return apiRequest(endpoints.auth.changePassword, { method: "POST", body: { currentPassword, newPassword } });
}
