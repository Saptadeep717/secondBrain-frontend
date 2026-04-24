import { useAuthStore } from "@/stores/authStore";

const BASE_URL = " https://secondbrain-mly0.onrender.com";

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/v1/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const json = await res.json();
      const newToken = json.data?.accessToken;
      if (newToken) {
        useAuthStore.getState().setAccessToken(newToken);
        return newToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // If we receive an auth error, attempt to refresh the session (cookie-based)
  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: "include",
      });
    } else {
      useAuthStore.getState().clearAuth();
      window.location.href = "/login";
      throw new Error("Session expired");
    }
  }

  if (res.status === 204) return undefined as T;

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || "API error");
  }
  return json;
}

export { BASE_URL };
