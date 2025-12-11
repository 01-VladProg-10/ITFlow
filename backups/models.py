"""
Models for tracking database backups.
"""
from django.db import models


class DatabaseBackup(models.Model):
    """
    Model to track database backups.
    Records backup metadata and status.
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('cleaned', 'Cleaned Up'),
    ]
    
    backup_file = models.CharField(max_length=255, help_text="Backup filename")
    file_size = models.BigIntegerField(null=True, blank=True, help_text="Size in bytes")
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        help_text="Backup operation status"
    )
    created_at = models.DateTimeField(auto_now_add=True, help_text="When backup was created")
    completed_at = models.DateTimeField(null=True, blank=True, help_text="When backup completed")
    error_message = models.TextField(blank=True, help_text="Error details if failed")
    backup_path = models.CharField(
        max_length=512,
        blank=True,
        help_text="Full path to backup file"
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Database Backup'
        verbose_name_plural = 'Database Backups'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.backup_file} - {self.status}"
    
    def __repr__(self):
        return f"<DatabaseBackup({self.id}: {self.backup_file}, {self.status})>"
