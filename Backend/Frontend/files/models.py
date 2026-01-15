# files/models.py

from django.db import models
from django.conf import settings

class File(models.Model):
    FILE_TYPES = [
        ('pdf', 'PDF'),
        ('docx', 'DOCX'),
        ('zip', 'ZIP'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10, choices=FILE_TYPES, default='other')
    description = models.TextField(blank=True, null=True)
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='files',
        null=True,
        blank=True
    )
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_files'
    )
    visible_to_clients = models.BooleanField(default=False)
    uploaded_file_url = models.URLField(max_length=1024, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
