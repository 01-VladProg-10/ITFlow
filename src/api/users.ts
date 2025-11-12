import { API_BASE, apiFetch, auth } from "./auth";

// SimpleJWT за замовчуванням чекає username+password.
// Якщо у формі ти вводиш email — просто на відправці підставимо його у поле username.
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
