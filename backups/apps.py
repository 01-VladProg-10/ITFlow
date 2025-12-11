from django.apps import AppConfig


class BackupsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backups'
    verbose_name = 'Database Backups'

    def ready(self):
        """Initialize backup scheduler when app is ready."""
        from .scheduler import start_backup_scheduler
        start_backup_scheduler()
