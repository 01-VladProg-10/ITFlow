const API_BASE = "http://127.0.0.1:8080/api";

// Local access token holder
let accessToken: string | null = null;

export const auth = {
  getAccess: () => accessToken,
  setAccess: (t: string | null) => { accessToken = t; },
  clear: () => { accessToken = null; },
};

export { API_BASE };

/**
 * apiFetch
 * - domyślnie JSON (dodaje Content-Type)
 * - przy raw: true nie ustawia Content-Type
 * - zawsze dodaje Authorization, jeśli jest token
 * - obsługuje odświeżanie tokenu i retry
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit & { raw?: boolean } = {}
) {
  const isRaw = init.raw === true;

  // Headers dla pierwszego requestu
  const headers = new Headers(
    isRaw
      ? (init.headers || {}) // RAW—nie dodajemy nic
      : { "Content-Type": "application/json", ...(init.headers || {}) }
  );

  const token = auth.getAccess();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // Pierwsza próba
  const res = await fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });

  // Jeśli nie ma 401 — zwróć odpowiedź
  if (res.status !== 401) return res;

  // Spróbuj odświeżyć token
  const ok = await refreshAccess();
  if (!ok) return res;

  const newToken = auth.getAccess();

  // Headers dla retry
  const retryHeaders = new Headers(
    isRaw
      ? (init.headers || {})
      : { "Content-Type": "application/json", ...(init.headers || {}) }
  );

  if (newToken) retryHeaders.set("Authorization", `Bearer ${newToken}`);

  // Retry requestu
  return fetch(input, {
    ...init,
    headers: retryHeaders,
    credentials: "include",
  });
}

/**
 * refreshAccess
 * - wysyła refresh cookie
 * - otrzymuje nowy Access Token
 */
export async function refreshAccess(): Promise<boolean> {
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
