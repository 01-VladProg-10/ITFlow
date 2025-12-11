"""
Django admin configuration for backup management.
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import DatabaseBackup


@admin.register(DatabaseBackup)
class DatabaseBackupAdmin(admin.ModelAdmin):
    """Admin interface for DatabaseBackup model."""
    
    list_display = [
        'backup_file',
        'status_badge',
        'file_size_display',
        'created_at',
        'completed_at'
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['backup_file', 'error_message']
    readonly_fields = [
        'backup_file',
        'file_size',
        'created_at',
        'completed_at',
        'backup_path',
        'error_message'
    ]
    
    fieldsets = (
        ('Backup Information', {
            'fields': ('backup_file', 'backup_path', 'file_size')
        }),
        ('Status', {
            'fields': ('status', 'error_message')
        }),
        ('Timing', {
            'fields': ('created_at', 'completed_at')
        }),
    )
    
    def has_add_permission(self, request):
        """Prevent manual addition via admin."""
        return False
    
    def has_delete_permission(self, request, obj=None):
        """Allow deletion of backup records."""
        return True
    
    def status_badge(self, obj):
        """Display status with color coding."""
        colors = {
            'success': 'green',
            'failed': 'red',
            'running': 'blue',
            'pending': 'gray',
            'cleaned': 'orange',
        }
        color = colors.get(obj.status, 'gray')
        return format_html(
            f'<span style="color: {color}; font-weight: bold;">{obj.get_status_display()}</span>'
        )
    status_badge.short_description = 'Status'
    
    def file_size_display(self, obj):
        """Display file size in human-readable format."""
        if not obj.file_size:
            return "—"
        
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.2f} {unit}"
            size /= 1024
        return f"{size:.2f} TB"
    file_size_display.short_description = 'File Size'
