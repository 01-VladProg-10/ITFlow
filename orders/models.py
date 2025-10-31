from django.db import models
from django.conf import settings


class Order(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Zgłoszone'),
        ('accepted', 'Przyjęte'),
        ('in_progress', 'W realizacji'),
        ('done', 'Zakończone'),
        ('rejected', 'Odrzucone'),
    ]

    title = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='submitted'
    )

    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='client_orders'
    )
    manager = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='managed_orders',
        null=True,
        blank=True
    )
    developer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        related_name='developed_orders',
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
