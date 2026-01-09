# notifications/email_utils.py

from django.core.mail import EmailMessage
from django.conf import settings
from orders.models import Order  # 🚨 Upewnij się, że ścieżka do Order jest poprawna


def send_custom_order_email(order_id: int, subject: str, message: str, file_content: bytes, filename: str) -> bool:
    """
    Wysyła e-mail z załącznikiem do klienta powiązanego z danym zleceniem.
    """
    try:
        # Pobranie zlecenia i powiązanego klienta
        order = Order.objects.select_related('client').get(pk=order_id)
        recipient_email = order.client.email

        if not recipient_email:
            print(f"Błąd: Klient zlecenia #{order_id} nie ma przypisanego e-maila.")
            return False

    except Order.DoesNotExist:
        print(f"Błąd: Nie znaleziono zlecenia o ID {order_id}")
        return False
    except AttributeError:
        print(f"Błąd: Klient zlecenia #{order_id} lub jego e-mail jest nieprawidłowy.")
        return False

    try:
        # Utworzenie obiektu wiadomości e-mail
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email]
        )

        # Dodanie załącznika
        # Używamy application/octet-stream jako bezpiecznego, domyślnego typu binarnego
        email.attach(filename, file_content, 'application/octet-stream')

        # Wysyłka
        email.send()
        return True
    except Exception as e:
        print(f"Błąd podczas wysyłki e-maila dla zlecenia #{order_id}: {e}")
        return False