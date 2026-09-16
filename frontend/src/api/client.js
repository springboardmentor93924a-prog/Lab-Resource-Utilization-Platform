// Central HTTP client for talking to the Spring Boot backend.
// Reads/writes the JWT to localStorage under LABFLOW_TOKEN_KEY so a page
// refresh doesn't sign the user out.

// Backend origin comes from the Vite env var VITE_API_URL (e.g.
// http://localhost:8080 locally, https://<your-service>.onrender.com in production).
// VITE_API_BASE_URL is still honoured for backwards compatibility; a trailing
// "/api" on either value is stripped so the "/api" suffix is never duplicated.
const RAW_API_URL = (
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8080"
).trim().replace(/\/+$/, "");

/** Backend origin, no trailing slash and no "/api" suffix. */
export const API_ORIGIN = RAW_API_URL.replace(/\/api$/, "");

/** Base URL for REST calls. All existing code appends paths like "/bookings". */
export const API_BASE_URL = `${API_ORIGIN}/api`;

/** WebSocket origin derived from the same env var (http -> ws, https -> wss). */
export const WS_ORIGIN = API_ORIGIN.replace(/^http/, "ws");

const TOKEN_KEY = "labflow_token";
const USER_KEY = "labflow_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * apiFetch("/bookings", { method: "POST", body: {...} })
 */
export async function apiFetch(path, { method = "GET", body, params } = {}) {
  let url = `${API_BASE_URL}${path}`;

  if (params) {
    const query = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");
    if (query) url += `?${query}`;
  }

  const headers = {};
  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body instanceof FormData ? body : (body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined),
    });
  } catch (networkErr) {
    if (networkErr instanceof ApiError) throw networkErr;
    throw new ApiError(
      "Could not reach the LabFlow Pro server. Please make sure the backend is running and try again.",
      0
    );
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    const message = payload?.message || `Request failed with status ${response.status}`;
    if (response.status === 401) clearSession();
    throw new ApiError(message, response.status);
  }

  return payload;
}

export { ApiError };
