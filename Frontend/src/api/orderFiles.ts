// src/api/orderFiles.ts
// Założenia:
// - apiFetch jest używany dla operacji JSON.
// - Dla FormData (uploadFile) musimy użyć globalnego fetch i POBRAĆ TOKEN PRZEZ auth.getAccess().
import { API_BASE, apiFetch, auth } from "./auth"; // <-- UPEWNIJ SIĘ, ŻE IMPORTUJESZ 'auth'

export type OrderFile = {
  // ... (reszta typów bez zmian)
  id: number;
  order: number;
  name: string;
  size?: number;
  description?: string;
  file_type?: string;
  visible_to_clients?: boolean;
  uploaded_file_url: string;
};

// ... (fetchFilesByOrder bez zmian)
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
 * Upload pliku (FormData) – Używa globalnego 'fetch' i POZYCJA AUTORYZACJI Z auth.
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

  // --- Używamy globalnego fetch z RĘCZNĄ autoryzacją z auth.getAccess() ---
  // POPRAWKA: Pobieramy token z obiektu 'auth', a nie z localStorage.
  const token = auth.getAccess(); 
  if (!token) throw new Error("Brak tokenu autoryzacji.");

  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Authorization": `Bearer ${token}` 
    },
    body: formData,
  });
  // -------------------------------------------------------------------------

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json ? JSON.stringify(json) : "Nie udało się wgrać pliku.");

  return json as OrderFile;
}

// ... (updateFileVisibility bez zmian)
export async function updateFileVisibility(fileId: number, visible: boolean): Promise<OrderFile> {
  const res = await apiFetch(`${API_BASE}/files/${fileId}/visibility/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" }, 
    body: JSON.stringify({ visible_to_clients: visible }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json ? JSON.stringify(json) : "Nie udało się zmienić widoczności pliku.");
  }
  
  return json as OrderFile;
}

/**
 * 📥 Pobieranie raportu PDF dla zamówienia.
 * Używa globalnego 'fetch' i ręcznej autoryzacji do obsługi odpowiedzi binarnej (PDF).
 * @param orderId ID zamówienia.
 * @returns Obiekt Blob reprezentujący plik PDF.
 */
export async function downloadReport(orderId: number): Promise<Blob> {
    const token = auth.getAccess(); 
    if (!token) throw new Error("Brak tokenu autoryzacji.");

    // Endpoint musi pasować do tego, który dodaliśmy w pliku files/urls.py na Back-endzie
    const url = `${API_BASE}/files/order/${orderId}/final_report/`; 

    // --- Używamy globalnego fetch z RĘCZNĄ autoryzacją ---
    const res = await fetch(url, {
        method: "GET", 
        headers: { 
            "Authorization": `Bearer ${token}`,
            // Nie dodajemy Content-Type, bo Back-end zwróci PDF
        },
    });
    // ---------------------------------------------------

    if (!res.ok) {
        // Spróbuj odczytać wiadomość o błędzie, jeśli istnieje
        const errorText = await res.text().catch(() => 'Błąd serwera.');
        
        throw new Error(`Nie udało się pobrać raportu. Status: ${res.status}. Odpowiedź: ${errorText.substring(0, 100)}`);
    }

    // Oczekujemy odpowiedzi binarnej (Blob), którą Front-end wykorzysta do pobrania pliku.
    const pdfBlob = await res.blob();
    
    // Opcjonalna walidacja typu (jeśli serwer nie zwrócił Content-Type: application/pdf)
    if (pdfBlob.type && pdfBlob.type !== 'application/pdf') {
         // Czasami błąd serwera (np. 403/500) może być tekstem, który zostanie odczytany jako Blob.
         // Zwykle jest to dobrze obsługiwane przez res.ok, ale to jest dodatkowe zabezpieczenie.
         console.warn(`Otrzymano inny typ zawartości niż PDF: ${pdfBlob.type}`);
    }

    return pdfBlob;
}