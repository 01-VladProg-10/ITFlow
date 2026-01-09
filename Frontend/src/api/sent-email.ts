import { apiFetch, API_BASE } from "./auth";

export async function sendOrderEmailWithAttachment(
  orderId: number,
  emailSubject: string,
  emailBody: string,
  attachmentData: File | null = null,
): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append("subject", emailSubject);
  formData.append("message", emailBody);
  if (attachmentData) formData.append("file_attachment", attachmentData);

  // ❗ używamy apiFetch → dodaje token + cookies + retry
  const res = await apiFetch(`${API_BASE}/notifications/order/${orderId}/send-email/`, {
    method: "POST",
    body: formData,
    raw: true, // nie dodaje Content-Type, żeby FormData działało
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData?.error || "Nie udało się wysłać maila z załącznikiem");
  }

  return res.json().catch(() => ({
    success: true,
    message: "Mail został pomyślnie wysłany.",
  }));
}
