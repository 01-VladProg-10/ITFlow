from django.db import models
from django.conf import settings
from files.models import File


class OrderLog(models.Model):
    EVENT_TYPES = [
        ('status_change', 'Zmiana Statusu'),
        ('comment', 'Komentarz/Notatka'),
        ('file_added', 'Dodanie Pliku'),
        ('assignment', 'Przypisanie Osoby'),
        ('other', 'Inne'),
    ]

    order = models.ForeignKey(
        'orders.Order',   # <-- POPRAWIONO!
        on_delete=models.CASCADE,
        related_name='history'
    )

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_actions'
    )

    file = models.ForeignKey(
        File,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='log_entries'
    )

    event_type = models.CharField(
        max_length=50,
        choices=EVENT_TYPES,
        default='comment'
    )

    description = models.TextField()
    old_value = models.CharField(max_length=100, blank=True, null=True)
    new_value = models.CharField(max_length=100, blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Dziennik Zlecenia"
        verbose_name_plural = "Dzienniki Zleceń"
        ordering = ['timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {self.order.title}: {self.get_event_type_display()}"