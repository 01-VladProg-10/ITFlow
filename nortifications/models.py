from django.db import models

class ContactMessage(models.Model):
    first_name = models.CharField(max_length=100, default="")
    last_name = models.CharField(max_length=100, default="")
    email = models.EmailField()
    request_message = models.TextField()       # wiadomość od klienta
    response_message = models.TextField(blank=True, null=True)  # odpowiedź od admina
    is_answered = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
