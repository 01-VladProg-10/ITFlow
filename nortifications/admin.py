from django.contrib import admin

from nortifications.models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'subject', 'email', 'created_at')
    search_fields = ('subject', 'email', 'message')
    ordering = ('-created_at',)
