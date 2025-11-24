from django.contrib import admin
from django.utils.html import format_html
from files.models import File

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'order',
        'file_type',
        'uploaded_by',
        'visible_to_clients',
        'file_link',       # zamiast uploaded_file
        'created_at'
    )
    list_filter = (
        'file_type',
        'visible_to_clients',
        'order',
    )
    search_fields = (
        'name',
        'description',
        'order__id',
        'order__title',
    )
    readonly_fields = ('uploaded_by', 'created_at', 'updated_at')
    autocomplete_fields = ('order',)

    def save_model(self, request, obj, form, change):
        if not obj.uploaded_by:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)

    def file_link(self, obj):
        if obj.uploaded_file_url:
            return format_html('<a href="{}" target="_blank">Otwórz plik</a>', obj.uploaded_file_url)
        return "-"
    file_link.short_description = "Plik (URL)"

from django.contrib import admin
from .models import File

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('name', 'file_type', 'uploaded_by', 'visible_to_clients', 'created_at')
    list_filter = ('file_type', 'visible_to_clients')
    search_fields = ('name', 'description')
