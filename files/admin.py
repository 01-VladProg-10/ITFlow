from django.contrib import admin
from .models import File

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('name', 'file_type', 'uploaded_by', 'visible_to_clients', 'created_at')
    list_filter = ('file_type', 'visible_to_clients')
    search_fields = ('name', 'description')
