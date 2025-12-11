"""
Scheduler for automated database backups every 48 hours.
Uses APScheduler for reliable background task scheduling.
"""
import logging
from datetime import datetime, timedelta
from apscheduler.schedulers.background import BackgroundScheduler
from django.conf import settings
from .backup_utils import BackupManager

logger = logging.getLogger(__name__)

# Global scheduler instance
_scheduler = None


def start_backup_scheduler():
    """
    Start the backup scheduler.
    Schedules backups to run every 48 hours.
    """
    global _scheduler
    
    # Prevent duplicate scheduler instances
    if _scheduler is not None and _scheduler.running:
        logger.debug("Backup scheduler already running")
        return
    
    # Don't start scheduler in management commands or migrations
    if settings.DEBUG and not _should_start_scheduler():
        return
    
    try:
        _scheduler = BackgroundScheduler(daemon=True)
        
        # Schedule backup task every 48 hours
        _scheduler.add_job(
            run_backup_task,
            'interval',
            hours=48,
            id='database_backup_48h',
            name='Database Backup (Every 48 hours)',
            replace_existing=True,
            max_instances=1,
        )
        
        # Schedule cleanup task every 7 days
        _scheduler.add_job(
            run_cleanup_task,
            'interval',
            days=7,
            id='backup_cleanup_7d',
            name='Backup Cleanup (Every 7 days)',
            replace_existing=True,
            max_instances=1,
        )
        
        _scheduler.start()
        logger.info("Database backup scheduler started successfully")
        logger.info("Backup scheduled every 48 hours, cleanup every 7 days")
        
    except Exception as e:
        logger.error(f"Failed to start backup scheduler: {str(e)}")


def stop_backup_scheduler():
    """Stop the backup scheduler."""
    global _scheduler
    
    if _scheduler and _scheduler.running:
        _scheduler.shutdown()
        _scheduler = None
        logger.info("Backup scheduler stopped")


def run_backup_task():
    """
    Run the database backup task.
    Called automatically by scheduler every 48 hours.
    """
    try:
        logger.info("Running scheduled database backup...")
        manager = BackupManager()
        backup = manager.create_backup()
        logger.info(
            f"Scheduled backup completed: {backup.backup_file} "
            f"({backup.file_size / 1024 / 1024:.2f} MB)"
        )
    except Exception as e:
        logger.error(f"Scheduled backup failed: {str(e)}")


def run_cleanup_task():
    """
    Run the backup cleanup task.
    Called automatically by scheduler every 7 days.
    """
    try:
        logger.info("Running scheduled backup cleanup...")
        manager = BackupManager()
        count = manager.cleanup_old_backups(days=7)
        logger.info(f"Cleanup completed: {count} old backups removed")
    except Exception as e:
        logger.error(f"Scheduled cleanup failed: {str(e)}")


def _should_start_scheduler():
    """
    Check if scheduler should be started.
    Returns False during migrations or management commands.
    """
    import sys
    
    # Don't start during migrations or management commands
    if 'migrate' in sys.argv or 'makemigrations' in sys.argv:
        return False
    
    if 'manage.py' in sys.argv[0]:
        # Check if it's a management command
        if len(sys.argv) > 1 and not sys.argv[1].startswith('-'):
            return False
    
    return True


def get_scheduler_status():
    """
    Get current scheduler status.
    
    Returns:
        dict: Scheduler status information
    """
    global _scheduler
    
    if _scheduler is None:
        return {
            'running': False,
            'jobs': []
        }
    
    jobs_info = []
    for job in _scheduler.get_jobs():
        jobs_info.append({
            'id': job.id,
            'name': job.name,
            'trigger': str(job.trigger),
            'next_run': job.next_run_time.isoformat() if job.next_run_time else None
        })
    
    return {
        'running': _scheduler.running,
        'jobs': jobs_info
    }
