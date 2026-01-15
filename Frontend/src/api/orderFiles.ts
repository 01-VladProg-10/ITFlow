// src/api/orderFiles.ts
import { API_BASE, apiFetch } from "./auth";

export type OrderFile = {
  id: number;
  order: number;
  name: string;
  size: number;        // в байтах
  url: string;         // посилання на файл (якщо потрібно)
};

// БЕЗ кінцевого слеша, щоб не було // в URL
// API_BASE = "http://127.0.0.1:8080/api"
// ORDERS_URL = "http://127.0.0.1:8080/api/orders"
const ORDERS_URL = `${API_BASE}/orders`;

/**
 * GET /api/orders/:id/files/
 */
export async function fetchOrderFiles(orderId: number): Promise<OrderFile[]> {
  const res = await apiFetch(`${ORDERS_URL}/${orderId}/files/`, {
    method: "GET",
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json && typeof json === "object"
        ? JSON.stringify(json)
        : "Nie udało się pobrać plików zamówienia.";
    throw new Error(msg);
  }

  return json as OrderFile[];
}

/**
 * POST /api/orders/:id/files/send-to-client/
 * body: { file_ids: number[] }
 */
export async function sendFilesToClient(
  orderId: number,
  fileIds: number[]
): Promise<void> {
  const res = await apiFetch(`${ORDERS_URL}/${orderId}/files/send-to-client/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file_ids: fileIds }),
  });

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      json && typeof json === "object"
        ? JSON.stringify(json)
        : "Nie udało się wysłać plików do klienta.";
    throw new Error(msg);
  }
}

/**
 * GET /api/orders/:id/files/download/?file_ids=1&file_ids=2
 */
export function buildDownloadUrl(orderId: number, fileIds: number[]): string {
  const params = new URLSearchParams();
  fileIds.forEach((id) => params.append("file_ids", String(id)));
  return `${ORDERS_URL}/${orderId}/files/download/?${params.toString()}`;
}
