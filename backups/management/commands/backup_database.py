"""
Django management command for creating database backups.
Usage: python manage.py backup_database
"""
from django.core.management.base import BaseCommand, CommandError
from backups.backup_utils import BackupManager
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Create a backup of the PostgreSQL database'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--cleanup',
            action='store_true',
            help='Clean up backups older than 7 days after creating backup',
        )
        parser.add_argument(
            '--cleanup-only',
            action='store_true',
            help='Only run cleanup without creating a new backup',
        )
        parser.add_argument(
            '--cleanup-days',
            type=int,
            default=7,
            help='Number of days of backups to keep (default: 7)',
        )
    
    def handle(self, *args, **options):
        """Execute backup operation."""
        try:
            manager = BackupManager()
            
            if options['cleanup_only']:
                self.stdout.write(
                    self.style.WARNING('Running cleanup only...')
                )
                count = manager.cleanup_old_backups(options['cleanup_days'])
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Cleanup completed: {count} backups removed'
                    )
                )
            else:
                # Create backup
                self.stdout.write(
                    self.style.WARNING('Starting database backup...')
                )
                backup = manager.create_backup()
                self.stdout.write(
                    self.style.SUCCESS(
                        f'✓ Backup created successfully!\n'
                        f'  File: {backup.backup_file}\n'
                        f'  Size: {backup.file_size / 1024 / 1024:.2f} MB\n'
                        f'  Path: {backup.backup_path}'
                    )
                )
                
                # Run cleanup if requested
                if options['cleanup']:
                    self.stdout.write(
                        self.style.WARNING(
                            f'Cleaning up backups older than '
                            f'{options["cleanup_days"]} days...'
                        )
                    )
                    count = manager.cleanup_old_backups(options['cleanup_days'])
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Cleanup completed: {count} backups removed'
                        )
                    )
            
            # Display stats
            stats = manager.get_backup_stats()
            self.stdout.write(
                self.style.SUCCESS(
                    f'\n📊 Backup Statistics:\n'
                    f'  Total backups: {stats["total_backups"]}\n'
                    f'  Successful: {stats["successful"]}\n'
                    f'  Failed: {stats["failed"]}\n'
                    f'  Total size: {stats["total_size"]}'
                )
            )
            
        except Exception as e:
            logger.error(f"Backup command failed: {str(e)}")
            raise CommandError(f'Backup failed: {str(e)}')
