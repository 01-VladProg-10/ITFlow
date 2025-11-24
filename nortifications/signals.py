from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in
from django.db.models.signals import post_save, m2m_changed
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.models import Group
from django.forms.models import model_to_dict

from orders.models import Order
from accounts.models import User


# ==============================================================
# Унифицированная отправка email без отдельного сервиса
# ==============================================================
def send_email(to, subject, message):
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [to],
        fail_silently=False,
    )


# ==============================================================
# 1. Powiadomienie – użytkownik zalogował się
# ==============================================================
@receiver(user_logged_in)
def notify_user_login(sender, user, request, **kwargs):
    device = request.META.get("HTTP_USER_AGENT", "Unknown device")
    ip = request.META.get("REMOTE_ADDR", "Unknown IP")

    subject = "🔐 Nowe logowanie na Twoje konto"
    message = (
        f"Cześć, {user.username}!\n\n"
        f"Twoje konto zostało zalogowane.\n"
        f"Urządzenie: {device}\n"
        f"IP: {ip}\n\n"
        "Jeśli to nie Ty — skontaktuj się z obsługą!"
    )

    send_email(user.email, subject, message)


# ==============================================================
# 2. Powiadomienie – rejestracja nowego użytkownika
# ==============================================================
@receiver(post_save, sender=User)
def notify_user_registration(sender, instance, created, **kwargs):
    if not created:
        return

    subject = "🎉 Witamy w ITFlow!"
    message = (
        f"Cześć, {instance.username}!\n\n"
        "Dziękujemy za wybranie naszych usług.\n"
        "Twoje konto zostało utworzone! 🚀\n"
        "Pozdrawiamy,\nZespół ITFlow"
    )

    send_email(instance.email, subject, message)


# ==============================================================
# 3. Powiadomienie – dodanie zamówienia
# ==============================================================
@receiver(post_save, sender=Order)
def notify_order_created(sender, instance, created, **kwargs):
    if not created:
        return

    subject = "📨 Twoje zamówienie zostało przyjęte"
    message = (
        f"Cześć {instance.client.username}!\n\n"
        f"Twoje zgłoszenie '{instance.title}' zostało wysłane do rozpatrzenia.\n"
        "Będziemy Cię informować o każdej zmianie statusu.\n\n"
        "Pozdrawiamy,\nZespół ITFlow"
    )

    send_email(instance.client.email, subject, message)


# ==============================================================
# 4. Powiadomienie – zmiana statusu zamówienia
# ==============================================================
@receiver(post_save, sender=Order)
def notify_order_status_change(sender, instance, created, **kwargs):
    if created:
        return  # to był "create", który obsłużyliśmy wyżej

    subject = f"🔄 Status zamówienia: {instance.title}"
    message = (
        f"Cześć {instance.client.username}!\n\n"
        f"Status Twojego zamówienia został zmieniony na:\n"
        f"➡ {instance.get_status_display()}\n\n"
        "Pozdrawiamy,\nZespół ITFlow"
    )

    send_email(instance.client.email, subject, message)


# ==============================================================
# 5. Powiadomienie – zmiana ról użytkownika (m2m_changed)
# ==============================================================
@receiver(m2m_changed, sender=User.groups.through)
def notify_user_role_change(sender, instance, action, pk_set, **kwargs):
    if action != "post_add":
        return

    roles = Group.objects.filter(pk__in=pk_set)
    role_names = ", ".join([r.name for r in roles])

    subject = "🔧 Zmiana ról użytkownika"
    message = (
        f"Cześć {instance.username}!\n\n"
        f"Administrator zmienił Twoją rolę na: {role_names}.\n"
        "Jeśli to nie Ty — zgłoś to do obsługi."
    )

    send_email(instance.email, subject, message)
