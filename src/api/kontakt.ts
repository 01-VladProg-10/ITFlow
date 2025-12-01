// src/api/kontakt.ts
import { apiFetch, API_BASE } from "./auth";

/**
 * Pobiera dane aktualnie zalogowanego użytkownika.
 * Zwraca JSON z polami: username, first_name, last_name, email, company
 */
export async function getUserProfile() {
  const res = await apiFetch(`${API_BASE}/accounts/users/me/`, {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error("Nie udało się pobrać danych użytkownika");
  }

  return await res.json();
}

/**
 * Aktualizuje profil użytkownika.
 * payload: { username, first_name, last_name, email, company?, password?, password_verify? }
 */
export async function updateUserProfile(payload: {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  password?: string;
  password_verify?: string;
}) {
  // Ignorujemy company, jeśli backend go nie używa
  const { company, ...dataToSend } = payload;

  const res = await apiFetch(`${API_BASE}/accounts/users/me/`, {
    method: "PUT", // lub "PATCH" jeśli tylko częściowa aktualizacja
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataToSend),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.message || "Nie udało się zaktualizować profilu");
  }

  return await res.json();
}

/**
 * Wysyła wiadomość kontaktową na backend
 * payload: { first_name, last_name, email, request_message }
 */
export async function sendContactMessage(payload: {
  first_name: string;
  last_name: string;
  email: string;
  request_message: string;
}) {
  const res = await apiFetch(`${API_BASE}/notifications/contact/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.message || "Nie udało się wysłać wiadomości");
  }

  return await res.json();
}