from django.db import models
from django.conf import settings
from files.models import File


class Order(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Zgłoszone'),
        ('accepted', 'Przyjęte'),
        ('in_progress', 'W realizacji'),
        ('awaiting_review', 'Oczekuje na Weryfikację Klienta'),
        ('client_review', 'Proszę sprawdzić'),
        ('rework_requested', 'Wysłane do Poprawki przez Klienta'),
        ('client_fix', 'Proszę poprawić'),
        ('done', 'Zakończone'),
        ('rejected', 'Odrzucone'),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')

    client = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='client_orders')
    manager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name='managed_orders', null=True, blank=True)
    developer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, related_name='developed_orders', null=True, blank=True)

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    # -------------------------------------------------------------
    # 🔥 UNIWERSALNE LOGOWANIE ZDARZEŃ
    # -------------------------------------------------------------
    def log_event(self, user, event_type, description, old_value=None, new_value=None, file=None):
        # Lazy import (unikamy circular import)
        from orderLog.models import OrderLog

        OrderLog.objects.create(
            order=self,
            actor=user,
            event_type=event_type,
            description=description,
            old_value=old_value,
            new_value=new_value,
            file=file
        )

    # -------------------------------------------------------------
    # 🔥 LOGOWANIE ZMIANY STATUSU
    # -------------------------------------------------------------
    def update_status_and_log(self, new_status, user):
        old_status = self.status
        self.status = new_status
        self.save()

        # Pobranie ładnych etykiet z STATUS_CHOICES
        display_old = dict(self.STATUS_CHOICES).get(old_status, old_status)
        display_new = dict(self.STATUS_CHOICES).get(new_status, new_status)

        self.log_event(
            user=user,
            event_type='status_change',
            description=f'Status zmieniony z "{display_old}" na "{display_new}"',
            old_value=old_status,
            new_value=new_status
        )

    # -------------------------------------------------------------
    # 🔥 LOGOWANIE DODANIA PLIKU (opcjonalne, przydatne)
    # -------------------------------------------------------------
    def log_file_added(self, user, file):
        self.log_event(
            user=user,
            event_type='file_added',
            description=f'Dodano plik: {file.name}',
            file=file
        )
