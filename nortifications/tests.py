from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings

def send_test_email(request):
    """Простая проверка реальной отправки email через SendGrid API."""
    subject = "🔥 Тестовое письмо от ITFlow"
    message = "Привет, Кирилл! Проверка отправки через SendGrid API без SMTP."
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = ["kirill2006651@gmail.com"]

    try:
        send_mail(subject, message, from_email, recipient_list, fail_silently=False)
        return JsonResponse({"status": "ok", "message": "Письмо успешно отправлено!"})
    except Exception as e:
        return JsonResponse({"status": "error", "error": str(e)})
