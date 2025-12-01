import { API_BASE, apiFetch, auth } from "./auth";

export async function loginUser(usernameOrEmail: string, password: string) {
  const res = await fetch(`${API_BASE}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username: usernameOrEmail, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(`Błąd logowania: ${res.status} ${JSON.stringify(err)}`);
  }
  const json = await res.json();
  if (json?.access) auth.setAccess(json.access);
  return json;
}

/** Старий тип, можеш ще десь використовувати */
export type MeResponse = {
  id: number;
  username: string;
  email: string;
  groups: { id: number; name: string }[];
};

export async function fetchMe(): Promise<MeResponse> {
  const res = await apiFetch(`${API_BASE}/accounts/users/me/`, { method: "GET" });
  if (!res.ok) throw new Error(`ME failed: ${res.status}`);
  return res.json();
}

/* ==== НОВЕ ДЛЯ DASHBOARD ==== */

export type LatestOrder = {
  id: number;
  title: string;
  description: string;
  status: string;
  manager: number | null;
  developer: number | null;
  client_detail: string | null;
  manager_detail: string | null;
  developer_detail: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardUser = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  groups: { id: number; name: string }[];
};

export type DashboardResponse = {
  user: DashboardUser;
  groups: string[];           // np. ["manager"]
  latest_order: LatestOrder | null;
};

export async function fetchDashboard(): Promise<DashboardResponse> {
  const res = await apiFetch(
    `${API_BASE}/accounts/users/dashboard/`,
    { method: "GET" }
  );
  if (!res.ok) throw new Error(`DASHBOARD failed: ${res.status}`);
  return res.json();
}
