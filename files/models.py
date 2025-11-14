from django.db import models
from django.conf import settings  # zamiast importować User bezpośrednio

class File(models.Model):
    FILE_TYPES = [
        ('pdf', 'PDF'),
        ('docx', 'DOCX'),
        ('zip', 'ZIP'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=255)
    uploaded_file = models.FileField(upload_to='uploads/')  # Cloudflare R2 storage
    file_type = models.CharField(max_length=10, choices=FILE_TYPES, default='other')
    description = models.TextField(blank=True, null=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # <--- używamy ustawień Django
        on_delete=models.SET_NULL,
        null=True,
        related_name='uploaded_files'
    )
    visible_to_clients = models.BooleanField(default=False)  # czy plik ma być widoczny dla klienta
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
