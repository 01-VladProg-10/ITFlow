// src/api/orders.ts
import { API_BASE, apiFetch } from "./auth";

export type Order = {
  id: number;
  title: string;
  description: string;
  status: string;
  developer: number | null;
  manager: number | null;
  created_at?: string;
  updated_at?: string;
};

// API_BASE = "http://127.0.0.1:8080/api"
// → ORDERS_URL = "http://127.0.0.1:8080/api/orders/"
const ORDERS_URL = `${API_BASE}/orders/`;

/**
 * Pobiera listę wszystkich zamówień.
 * GET /api/orders/
 */
export async function fetchOrders(): Promise<Order[]> {
  const res = await apiFetch(ORDERS_URL, {
    method: "GET",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json && typeof json === "object"
        ? JSON.stringify(json)
        : "Nie udało się pobrać listy zamówień.";
    throw new Error(msg);
  }

  return json as Order[];
}

type CreateOrderPayload = {
  title: string;
  description: string;
  status?: string;
  developer?: number | null;
  manager?: number | null;
};

/**
 * Tworzy nowe zamówienie.
 * POST /api/orders/
 */
export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const body = {
    title: payload.title,
    description: payload.description,
    status: payload.status ?? "submitted",
    developer: payload.developer ?? null,
    manager: payload.manager ?? null,
  };

  const res = await apiFetch(ORDERS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json && typeof json === "object"
        ? JSON.stringify(json)
        : "Nie udało się utworzyć zamówienia.";
    throw new Error(msg);
  }

  return json as Order;
}
