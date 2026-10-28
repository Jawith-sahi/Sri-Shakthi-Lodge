import { apiRequest } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { getMock, isMockApi } from "@/lib/api/helpers";

// Reports are computed by the backend. Dates are yyyy-MM-dd in IST (Asia/Kolkata).

export async function getDashboardSummary() {
  if (isMockApi()) return (await getMock()).reports.dashboard();
  return apiRequest(endpoints.reports.dashboard);
}

export async function getDailyReport({ from, to }) {
  if (isMockApi()) return (await getMock()).reports.daily({ from, to });
  return apiRequest(endpoints.reports.daily, { query: { from, to } });
}

export async function getMonthlyReport({ from, to }) {
  if (isMockApi()) return (await getMock()).reports.monthly({ from, to });
  return apiRequest(endpoints.reports.monthly, { query: { from, to } });
}

export async function getOccupancyReport({ from, to }) {
  if (isMockApi()) return (await getMock()).reports.occupancy({ from, to });
  return apiRequest(endpoints.reports.occupancy, { query: { from, to } });
}

export async function getEnquiryReport({ from, to }) {
  if (isMockApi()) return (await getMock()).reports.enquiries({ from, to });
  return apiRequest(endpoints.reports.enquiries, { query: { from, to } });
}

/**
 * Server-generated export (CSV or XLSX). The file is streamed by the backend - never assembled in the browser.
 * @param {{type:"bookings"|"daily"|"monthly"|"occupancy"|"enquiries", from:string, to:string, format?:"csv"|"xlsx"}} params
 * @returns {Promise<{blob:Blob, filename:string|null}>}
 */
export async function exportReport({ type, from, to, format = "csv" }) {
  if (isMockApi()) return (await getMock()).reports.export({ type, from, to, format });
  return apiRequest(endpoints.reports.export, { query: { type, from, to, format }, responseType: "blob", timeout: 120000 });
}
