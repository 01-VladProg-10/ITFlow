// src/api/message.ts
import { apiFetch, API_BASE } from "./auth";

export interface ContactMessage {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  request_message: string;
  response_message: string | null;
  is_answered: boolean;
  created_at: string;
}

/**
 * Pobiera wszystkie zgłoszenia kontaktowe (tylko manager)
 */
export async function getMessages(): Promise<ContactMessage[]> {
  const res = await apiFetch(`${API_BASE}/notifications/contact/all/`, {
    method: "GET",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.message || "Nie udało się pobrać zgłoszeń");
  }

  return res.json();
}

/**
 * Pobiera pojedyncze zgłoszenie po ID
 */
export async function getMessage(id: number): Promise<ContactMessage> {
  const res = await apiFetch(`${API_BASE}/notifications/contact/${id}/`, {
    method: "GET",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.message || "Nie udało się pobrać zgłoszenia");
  }

  return res.json();
}

/**
 * Odpowiada na zgłoszenie i ustawia is_answered = true
 */
export async function respondToMessage(
  id: number,
  response_message: string
): Promise<ContactMessage> {
  const res = await apiFetch(`${API_BASE}/notifications/contact/${id}/respond/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ response_message }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.message || "Nie udało się odpowiedzieć na zgłoszenie");
  }

  return res.json();
}
