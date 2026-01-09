// src/api/logs.ts
// Zmieniamy import, aby dodać apiFetch
import { API_BASE, apiFetch } from "./auth"; 

export interface LogEntry {
  id: number;
  event_type: "status_change" | "comment" | "file_added" | "assignment" | "other";
  description: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
  actor_name: string;
}

export async function fetchOrderLogs(orderId: number): Promise<LogEntry[]> {
  // ZMIANA: Używamy apiFetch, które automatycznie dodaje token (Bearer ${accessToken})
  // i obsługuje błędy 401 (odświeżanie tokenu)
  const res = await apiFetch(`${API_BASE}/order-log/order-history/${orderId}/`, {
    method: "GET", // apiFetch oczekuje, że metoda będzie ustawiona jawnie
  });

  // Przenosimy logikę obsługi JSON i błędów z Twojego działającego kodu
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json && typeof json === "object"
        ? JSON.stringify(json)
        : "Nie udało się pobrać historii logów.";
    throw new Error(msg);
  }

  return json as LogEntry[];
}