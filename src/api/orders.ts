// src/api/orders.ts
import { API_BASE, apiFetch } from "./auth";

export type Order = {
  id: number;
  title: string;
  description: string;
  status: string;
  developer: number | null;
  manager: number | null;
};

// API_BASE = "http://127.0.0.1:8080/api"
// Тоді endpoint /api/orders/ на бекенді відповідає `${API_BASE}/orders/`
const ORDERS_URL = `${API_BASE}/orders/`;

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

export async function createOrder(payload: {
  title: string;
  description: string;
}): Promise<Order> {
  const body = {
    title: payload.title,
    description: payload.description,
    status: "submitted",
    developer: null,
    manager: null,
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
