from django.contrib import admin
from nortifications.models import ContactMessage

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'email', 'is_answered', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'message', 'response_message')
    list_filter = ('is_answered', 'created_at')
    ordering = ('-created_at',)
    readonly_fields = ('created_at',)
