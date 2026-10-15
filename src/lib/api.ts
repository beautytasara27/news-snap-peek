import axios, { AxiosError } from "axios";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

const TOKEN_STORAGE_KEY = "newshub.token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    /* storage unavailable (private mode) - cookie auth still works */
  }
}

/**
 * Defaults to the same-origin `/api` path handled by the Vite dev proxy.
 * Set VITE_API_URL to point at the Flask server directly.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Bearer header is a fallback for browsers that drop the cross-site cookie.
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Human-readable message from an API envelope, or a sensible fallback. */
export function errorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as ApiEnvelope<unknown> | undefined;
    return payload?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message || fallback;
  return fallback;
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.status === 401;
}
