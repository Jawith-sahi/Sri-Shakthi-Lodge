// =====================================================================
// The ONE fetch wrapper used for every call to the .NET Web API.
//  - base URL from env, JSON in/out, empty (204) responses, multipart uploads, downloads
//  - timeouts + cancellation, normalised errors (ApiError)
//  - cookie auth by default (credentials: "include"); optional bearer token provider
//  - Next.js caching hints (revalidate + tags) for PUBLIC data only
// Components never build URLs: they call the *.api.js modules, which use endpoints.js.
// =====================================================================

import { env } from "@/config/environment";

const DEFAULT_TIMEOUT_MS = 15000;
const SERVER_TIMEOUT_MS = 8000;

/** Normalised error. `code` is stable (used for translated messages); `message` is an English fallback. */
export class ApiError extends Error {
  constructor({
    status = 0,
    code = "unknown",
    message = "Something went wrong.",
    serverMessage = "",
    fieldErrors = {},
    isNetwork = false,
    isTimeout = false,
    isAborted = false,
  } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.serverMessage = serverMessage; // text sent by the backend (shown to staff; shown to guests only for conflict/validation)
    this.fieldErrors = fieldErrors; // { fieldName: "message" }
    this.isNetwork = isNetwork;
    this.isTimeout = isTimeout;
    this.isAborted = isAborted;
  }
}

const FALLBACK_MESSAGES = {
  not_configured: "The booking service is not connected yet. Please contact the lodge directly.",
  network: "We could not reach the server. Please check your connection and try again.",
  timeout: "The request took too long. Please try again.",
  unauthorized: "Your session has ended. Please sign in again.",
  forbidden: "You do not have permission to do that.",
  not_found: "We could not find what you were looking for.",
  conflict: "That action conflicts with the current state. Please refresh and try again.",
  validation: "Please check the highlighted details and try again.",
  rate_limited: "Too many attempts. Please wait a moment and try again.",
  server: "Something went wrong on our side. Please try again shortly.",
  aborted: "Request cancelled.",
  unknown: "Something went wrong. Please try again.",
};

function codeFromStatus(status) {
  if (status === 401) return "unauthorized";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 409 || status === 412) return "conflict";
  if (status === 400 || status === 422) return "validation";
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server";
  return "unknown";
}

const lowerFirst = (s) => (s ? s.charAt(0).toLowerCase() + s.slice(1) : s);

/** Understands .NET ProblemDetails / ValidationProblemDetails and simple { message } bodies. */
function normaliseErrorBody(body) {
  const out = { serverMessage: "", fieldErrors: {} };
  if (!body || typeof body !== "object") {
    if (typeof body === "string" && body.length < 300) out.serverMessage = body;
    return out;
  }
  out.serverMessage = body.detail || body.message || body.title || "";
  const errors = body.errors;
  if (errors && typeof errors === "object" && !Array.isArray(errors)) {
    for (const [key, value] of Object.entries(errors)) {
      const text = Array.isArray(value) ? value.join(" ") : String(value);
      out.fieldErrors[lowerFirst(key)] = text;
    }
  }
  return out;
}

let tokenProvider = () => {
  if (typeof window !== "undefined") {
    try {
      return sessionStorage.getItem("sri_sakthi_token") || null;
    } catch {
      return null;
    }
  }
  return null;
};

export function setAccessToken(token) {
  if (typeof window !== "undefined") {
    try {
      if (token) sessionStorage.setItem("sri_sakthi_token", token);
      else sessionStorage.removeItem("sri_sakthi_token");
    } catch {
      /* ignore */
    }
  }
}

export function clearAccessToken() {
  setAccessToken(null);
}

/** Optional: if the backend uses custom bearer token provider, register a getter. */
export function setAccessTokenProvider(fn) {
  tokenProvider = typeof fn === "function" ? fn : () => {
    if (typeof window !== "undefined") {
      try { return sessionStorage.getItem("sri_sakthi_token") || null; } catch { return null; }
    }
    return null;
  };
}

let unauthorizedHandler = null;
/** Admin layout registers a handler that redirects to the login page on 401. */
export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === "function" ? fn : null;
}

// ── Silent Token Refresh ─────────────────────────────────────────────────────
// When a 401 is received for an authenticated request, attempt one silent
// token refresh using the HttpOnly RefreshToken cookie.  If refresh succeeds,
// retry the original request with the new token.  If refresh also fails,
// clear local state and redirect to login.
let _refreshPromise = null; // deduplicate concurrent refresh attempts

async function _silentRefresh(base) {
  if (!_refreshPromise) {
    _refreshPromise = fetch(`${base}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json().catch(() => null);
        const newToken = data?.accessToken || data?.token || null;
        if (newToken) setAccessToken(newToken);
        return newToken;
      })
      .catch(() => null)
      .finally(() => {
        _refreshPromise = null;
      });
  }
  return _refreshPromise;
}

function buildUrl(path, query) {
  const base = env.apiBaseUrl;
  const url = new URL(`${base}${path}`);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null || value === "") continue;
      if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, String(v)));
      else url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * @param {string} path  from endpoints.js
 * @param {object} [options]
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} [options.method]
 * @param {object} [options.query]
 * @param {object} [options.body]            JSON body
 * @param {FormData} [options.formData]      multipart body (uploads)
 * @param {boolean} [options.auth]           send cookies/token (default true)
 * @param {number} [options.revalidate]      seconds - PUBLIC data only
 * @param {string[]} [options.tags]          Next cache tags - PUBLIC data only
 * @param {number} [options.timeout]
 * @param {AbortSignal} [options.signal]
 * @param {string} [options.idempotencyKey]
 * @param {"json"|"blob"} [options.responseType]
 */
export async function apiRequest(path, options = {}) {
  return _apiRequestInner(path, options, false);
}

async function _apiRequestInner(path, options, isRetry) {
  const {
    method = "GET",
    query,
    body,
    formData,
    auth = true,
    revalidate,
    tags,
    timeout,
    signal,
    idempotencyKey,
    responseType = "json",
    headers: extraHeaders = {},
  } = options;

  if (!env.apiBaseUrl) {
    throw new ApiError({
      status: 0,
      code: "not_configured",
      message: FALLBACK_MESSAGES.not_configured,
    });
  }

  const isServer = typeof window === "undefined";
  const controller = new AbortController();
  const timeoutMs = timeout ?? (isServer ? SERVER_TIMEOUT_MS : DEFAULT_TIMEOUT_MS);
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const onExternalAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onExternalAbort, { once: true });
  }

  const headers = { Accept: "application/json", ...extraHeaders };
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  if (auth && tokenProvider) {
    const token = tokenProvider();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const init = { method, headers, signal: controller.signal };
  if (formData) {
    init.body = formData; // browser sets the multipart boundary
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  if (!isServer) init.credentials = "include";

  // Caching: only public GET data may be cached by Next. Everything else is never cached.
  if (method === "GET" && (revalidate !== undefined || tags)) {
    init.next = { ...(revalidate !== undefined ? { revalidate } : {}), ...(tags ? { tags } : {}) };
  } else {
    init.cache = "no-store";
  }

  let response;
  try {
    response = await fetch(buildUrl(path, query), init);
  } catch (error) {
    if (timedOut) {
      throw new ApiError({ code: "timeout", message: FALLBACK_MESSAGES.timeout, isTimeout: true });
    }
    if (error?.name === "AbortError") {
      throw new ApiError({ code: "aborted", message: FALLBACK_MESSAGES.aborted, isAborted: true });
    }
    throw new ApiError({ code: "network", message: FALLBACK_MESSAGES.network, isNetwork: true });
  } finally {
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onExternalAbort);
  }

  if (!response.ok) {
    let errorBody = null;
    try {
      const text = await response.text();
      if (text) {
        try {
          errorBody = JSON.parse(text);
        } catch {
          errorBody = text;
        }
      }
    } catch {
      /* ignore */
    }
    const { serverMessage, fieldErrors } = normaliseErrorBody(errorBody);
    const code = codeFromStatus(response.status);
    const error = new ApiError({
      status: response.status,
      code,
      message: FALLBACK_MESSAGES[code] || FALLBACK_MESSAGES.unknown,
      serverMessage,
      fieldErrors,
    });
    if (response.status === 401) {
      // ── Silent refresh & retry (only once, only on browser, only for auth requests) ──
      if (auth && !isRetry && !isServer) {
        const newToken = await _silentRefresh(env.apiBaseUrl);
        if (newToken) {
          // Retry the original request once with the refreshed token
          return _apiRequestInner(path, options, true);
        }
      }
      // Refresh failed or already retried — clear token and redirect to login
      clearAccessToken();
      if (auth && unauthorizedHandler) unauthorizedHandler(error);
    }
    throw error;
  }

  if (responseType === "blob") {
    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    return { blob, filename: match ? decodeURIComponent(match[1]) : null };
  }

  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Normalises list responses: accepts an array, { items, totalCount } or { data, total }. */
export function toPaged(result, { page = 1, pageSize = 20 } = {}) {
  if (Array.isArray(result)) {
    return { items: result, page, pageSize, totalCount: result.length, totalPages: 1 };
  }
  const items = result?.items ?? result?.data ?? [];
  const totalCount = result?.totalCount ?? result?.total ?? items.length;
  const size = result?.pageSize ?? pageSize;
  return {
    items,
    page: result?.page ?? page,
    pageSize: size,
    totalCount,
    totalPages: result?.totalPages ?? Math.max(1, Math.ceil(totalCount / size)),
  };
}

/** Triggers a browser download from a Blob. */
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || "download";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Server-component helper: { data, error } so pages can tell "empty" apart from "failed" without try/catch. */
export async function settle(promise) {
  try {
    return { data: await promise, error: null };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[api] request failed:", error?.code || error?.message);
    }
    return { data: null, error };
  }
}

/** Safe wrapper for server components: returns the fallback instead of throwing. */
export async function safely(promise, fallback = null) {
  try {
    return await promise;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[api] request failed:", error?.code || error?.message);
    }
    return fallback;
  }
}
