"""
Serializers for DatabaseBackup model.
"""
from rest_framework import serializers
from .models import DatabaseBackup


class DatabaseBackupSerializer(serializers.ModelSerializer):
    """Serializer for DatabaseBackup model."""
    
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )
    file_size_display = serializers.SerializerMethodField()
    
    class Meta:
        model = DatabaseBackup
        fields = [
            'id',
            'backup_file',
            'file_size',
            'file_size_display',
            'status',
            'status_display',
            'created_at',
            'completed_at',
            'error_message',
            'backup_path'
        ]
        read_only_fields = [
            'id',
            'backup_file',
            'file_size',
            'status',
            'created_at',
            'completed_at',
            'error_message',
            'backup_path'
        ]
    
    def get_file_size_display(self, obj):
        """Format file size in human-readable format."""
        if not obj.file_size:
            return "—"
        
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024:
                return f"{size:.2f} {unit}"
            size /= 1024
        return f"{size:.2f} TB"
