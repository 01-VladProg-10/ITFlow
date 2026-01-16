const API_BASE = "http://127.0.0.1:8080/api";

let accessToken: string | null = null;

export const auth = {
  getAccess: () => accessToken,
  setAccess: (t: string | null) => { accessToken = t; },
  clear: () => { accessToken = null; },
};
export { API_BASE };

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers || { "Content-Type": "application/json" });
  const token = auth.getAccess();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(input, { ...init, headers, credentials: "include" });

  if (res.status !== 401) return res;

  const ok = await refreshAccess();
  if (!ok) return res;

  const retryHeaders = new Headers(init.headers || { "Content-Type": "application/json" });
  const newToken = auth.getAccess();
  if (newToken) retryHeaders.set("Authorization", `Bearer ${newToken}`);
  return fetch(input, { ...init, headers: retryHeaders, credentials: "include" });
}

async function refreshAccess(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/token/refresh/`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => ({}));
    const newAccess = data?.access as string | undefined;
    if (!newAccess) return false;
    auth.setAccess(newAccess);
    return true;
  } catch {
    auth.clear();
    return false;
  }
}
