from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.conf import settings
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from .models import Order


def _get_user_email(user):
    """Безопасно получить email пользователя (если есть)."""
    return getattr(user, 'email', None) or None


@receiver(pre_save, sender=Order)
def order_status_changed(sender, instance: Order, **kwargs):
    """Отправляет уведомление при смене статуса заказа через SendGrid API."""
    if not instance.pk:
        return  # новый заказ, статуса раньше не было

    try:
        old = Order.objects.get(pk=instance.pk)
    except Order.DoesNotExist:
        return

    # Если статус изменился — шлём уведомления
    if old.status != instance.status:
        subject = f"[ITFlow] Order #{instance.pk}: {old.status} → {instance.status}"
        body = (
            f"Tytuł: {instance.title}\n"
            f"Opis: {instance.description}\n"
            f"Poprzedni status: {old.status}\n"
            f"Nowy status: {instance.status}\n"
        )

        # Получаем список email получателей
        recipients = []
        for u in (instance.client, instance.manager, instance.developer):
            email = _get_user_email(u)
            if email:
                recipients.append(email)

        # Если у заказчиков нет email — отправим админу
        if not recipients:
            recipients = [getattr(settings, 'ADMIN_NOTIFICATIONS_EMAIL', 'admin@example.com')]

        api_key = getattr(settings, 'SENDGRID_API_KEY', None)
        from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'itflow-notify@sendgrid.net')

        if not api_key:
            print("❌ SENDGRID_API_KEY отсутствует! Добавь в settings.py")
            return

        try:
            sg = SendGridAPIClient(api_key)
            for recipient in recipients:
                message = Mail(
                    from_email=from_email,
                    to_emails=recipient,
                    subject=subject,
                    plain_text_content=body
                )
                sg.send(message)
                print(f"📨 Email отправлен: {recipient}")
        except Exception as e:
            print(f"⚠️ Ошибка при отправке уведомления через SendGrid: {e}")
