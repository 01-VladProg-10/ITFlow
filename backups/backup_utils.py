"""
Database backup utilities for creating and managing backups.
"""
import os
import subprocess
import logging
from datetime import datetime
from pathlib import Path
from django.conf import settings
from django.db import connection
from .models import DatabaseBackup

logger = logging.getLogger(__name__)


class BackupManager:
    """
    Manages database backup operations.
    Creates dumps and tracks backup metadata.
    """
    
    def __init__(self):
        """Initialize backup manager."""
        self.backup_dir = Path(settings.BASE_DIR) / 'backups' / 'data'
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.db_config = settings.DATABASES['default']
    
    def create_backup(self):
        """
        Create a PostgreSQL database backup.
        
        Returns:
            DatabaseBackup: The backup record created
        """
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        db_name = self.db_config['NAME']
        filename = f"itflow_backup_{timestamp}.sql"
        filepath = self.backup_dir / filename
        
        # Create database backup record
        backup_record = DatabaseBackup.objects.create(
            backup_file=filename,
            backup_path=str(filepath),
            status='running'
        )
        
        try:
            logger.info(f"Starting database backup: {filename}")
            
            # Build pg_dump command
            env = os.environ.copy()
            env['PGPASSWORD'] = self.db_config.get('PASSWORD', '')
            
            cmd = [
                'pg_dump',
                '--host', self.db_config.get('HOST', 'localhost'),
                '--port', str(self.db_config.get('PORT', 5432)),
                '--username', self.db_config.get('USER', 'postgres'),
                '--format', 'plain',
                '--verbose',
                '--no-password',
                db_name
            ]
            
            # Execute pg_dump
            with open(filepath, 'w', encoding='utf-8') as f:
                result = subprocess.run(
                    cmd,
                    stdout=f,
                    stderr=subprocess.PIPE,
                    env=env,
                    timeout=3600  # 1 hour timeout
                )
            
            if result.returncode != 0:
                error_msg = result.stderr.decode('utf-8', errors='ignore')
                raise Exception(f"pg_dump failed: {error_msg}")
            
            # Get file size
            file_size = filepath.stat().st_size
            
            # Update backup record
            backup_record.status = 'success'
            backup_record.file_size = file_size
            backup_record.completed_at = datetime.now()
            backup_record.save()
            
            logger.info(
                f"Backup completed successfully: {filename} "
                f"({self._format_size(file_size)})"
            )
            
            return backup_record
            
        except Exception as e:
            error_msg = str(e)
            backup_record.status = 'failed'
            backup_record.error_message = error_msg
            backup_record.completed_at = datetime.now()
            backup_record.save()
            
            logger.error(f"Backup failed: {error_msg}")
            raise
    
    def cleanup_old_backups(self, days=7):
        """
        Clean up backup files older than specified days.
        
        Args:
            days: Number of days to keep backups
        """
        from datetime import timedelta
        
        cutoff_date = datetime.now() - timedelta(days=days)
        old_backups = DatabaseBackup.objects.filter(
            created_at__lt=cutoff_date,
            status__in=['success', 'failed']
        )
        
        count = 0
        for backup in old_backups:
            try:
                # Delete backup file
                if backup.backup_path and os.path.exists(backup.backup_path):
                    os.remove(backup.backup_path)
                    logger.info(f"Deleted backup file: {backup.backup_file}")
                
                # Update record status
                backup.status = 'cleaned'
                backup.save()
                count += 1
                
            except Exception as e:
                logger.error(
                    f"Failed to clean backup {backup.backup_file}: {str(e)}"
                )
        
        logger.info(f"Cleanup completed: {count} backups removed")
        return count
    
    @staticmethod
    def _format_size(bytes_size):
        """Format bytes to human-readable size."""
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024:
                return f"{bytes_size:.2f} {unit}"
            bytes_size /= 1024
        return f"{bytes_size:.2f} TB"
    
    def get_backup_stats(self):
        """
        Get backup statistics.
        
        Returns:
            dict: Statistics about backups
        """
        total_backups = DatabaseBackup.objects.count()
        successful = DatabaseBackup.objects.filter(status='success').count()
        failed = DatabaseBackup.objects.filter(status='failed').count()
        total_size = sum(
            b.file_size or 0 
            for b in DatabaseBackup.objects.filter(status='success')
        )
        
        return {
            'total_backups': total_backups,
            'successful': successful,
            'failed': failed,
            'total_size': self._format_size(total_size),
            'last_backup': DatabaseBackup.objects.filter(
                status='success'
            ).first()
        }
