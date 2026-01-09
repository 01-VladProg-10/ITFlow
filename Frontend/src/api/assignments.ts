
import { API_BASE, apiFetch } from "./auth";
import { type Order } from "./orders";

export type Programmer = {
  id: number;
  username: string;
  email: string;
  // Zakładamy, że to jest pełna definicja
};

/**
 * Pobieranie listy użytkowników z rolą 'programmer' (developerów).
 * GET /api/users/programmers/
 */
export async function fetchProgrammers(): Promise<Programmer[]> {
  // Zakładamy, że taki endpoint istnieje
  const res = await apiFetch(`${API_BASE}/accounts/users/programmers/`, {
    method: "GET",
  });
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json ? JSON.stringify(json) : "Nie udało się pobrać listy programistów.");
  }
  return json as Programmer[];
}

/**
 * Przypisywanie developera do zamówienia i automatyczne ustawianie zalogowanego managera.
 * Wymaga, aby backend ustawił pole 'manager' na ID zalogowanego managera.
 * POST /api/orders/{orderId}/assign-developer/
 */
export async function assignDeveloperAndManagerToOrder(
  orderId: number,
  developerId: number | null
): Promise<Order> {
  // Zakładamy, że backend sam pobierze ID managera z tokenu/sesji.
  const res = await apiFetch(`${API_BASE}/orders/${orderId}/assign-developer/`, {
    method: "POST", 
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ developer: developerId }), // Używamy 'developer' zgodnie z modelem
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      json ? JSON.stringify(json) : `Nie udało się przypisać developera/managera do zamówienia #${orderId}.`
    );
  }
  
  // Zakładamy, że API zwraca zaktualizowany obiekt Order (który ma pola 'developer' i 'manager')
  return json as Order;
}