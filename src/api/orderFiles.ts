import { API_BASE, apiFetch } from "./auth";

export type OrderFile = {
  id: number;
  order: number;
  name: string;
  size?: number;
  description?: string;
  file_type?: string;
  visible_to_clients?: boolean;
  uploaded_file_url: string;
};

/**
 * Pobiera listę plików dla danego zamówienia.
 */
export async function fetchFilesByOrder(orderId: number): Promise<OrderFile[]> {
  const res = await apiFetch(`${API_BASE}/files/order/${orderId}/`, {
    method: "GET",
  });
  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(json ? JSON.stringify(json) : "Nie udało się pobrać plików.");
  }

  return json as OrderFile[];
}

/**
 * Upload pliku (FormData) – używa fetch z logiką odświeżania tokenu
 */
export async function uploadFile(data: {
  file: File;
  order: number;
  name: string;
  file_type: string;
  description?: string;
  visible_to_clients?: boolean;
}): Promise<OrderFile> {
  const formData = new FormData();
  formData.append("uploaded_file", data.file);
  formData.append("name", data.name);
  formData.append("file_type", data.file_type);
  if (data.description) formData.append("description", data.description);
  formData.append("order", String(data.order));
  formData.append("visible_to_clients", String(data.visible_to_clients ?? false));

  const url = `${API_BASE}/files/upload/`;

  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Brak tokenu autoryzacji.");

  const res = await fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${token}` },
    body: formData,
    credentials: "include",
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json ? JSON.stringify(json) : "Nie udało się wgrać pliku.");

  return json as OrderFile;
}

/**
 * Zmiana widoczności pliku dla klientów
 */
export async function updateFileVisibility(fileId: number, visible: boolean) {
  const res = await apiFetch(`${API_BASE}/files/${fileId}/visibility/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ visible_to_clients: visible }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json ? JSON.stringify(json) : "Nie udało się zmienić widoczności pliku.");
  return json;
}

/**
 * NOWA FUNKCJA:
 * Otwiera wybrane pliki w nowych kartach przeglądarki po kolei,
 * korzystając z pola `uploaded_file_url` każdego pliku.
 */
export function openFilesInNewTabs(files: OrderFile[]) {
  for (const file of files) {
    if (file.uploaded_file_url) {
      window.open(file.uploaded_file_url, "_blank");
    }
  }
}
