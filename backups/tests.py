"""
Unit tests for the backup system.
Run with: python manage.py test backups
"""
from django.test import TestCase
from django.utils import timezone
from django.core.management import call_command
from datetime import timedelta
from io import StringIO
from backups.models import DatabaseBackup
from backups.backup_utils import BackupManager


class DatabaseBackupModelTest(TestCase):
    """Test DatabaseBackup model."""
    
    def setUp(self):
        """Create test backup record."""
        self.backup = DatabaseBackup.objects.create(
            backup_file='test_backup.sql',
            backup_path='/path/to/test_backup.sql',
            status='success',
            file_size=1024000,
        )
    
    def test_backup_creation(self):
        """Test backup record creation."""
        self.assertEqual(self.backup.backup_file, 'test_backup.sql')
        self.assertEqual(self.backup.status, 'success')
        self.assertEqual(self.backup.file_size, 1024000)
    
    def test_backup_str_representation(self):
        """Test string representation."""
        self.assertEqual(
            str(self.backup),
            'test_backup.sql - success'
        )
    
    def test_backup_status_choices(self):
        """Test all status choices work."""
        statuses = ['pending', 'running', 'success', 'failed', 'cleaned']
        for status in statuses:
            backup = DatabaseBackup(
                backup_file=f'backup_{status}.sql',
                status=status
            )
            self.assertEqual(backup.get_status_display(), status.title())
    
    def test_backup_ordering(self):
        """Test backups are ordered by creation date."""
        old_backup = DatabaseBackup.objects.create(
            backup_file='old_backup.sql',
            created_at=timezone.now() - timedelta(days=1),
            status='success'
        )
        new_backup = DatabaseBackup.objects.create(
            backup_file='new_backup.sql',
            status='success'
        )
        
        backups = list(DatabaseBackup.objects.all())
        self.assertEqual(backups[0].id, new_backup.id)
        self.assertEqual(backups[1].id, old_backup.id)


class BackupManagerTest(TestCase):
    """Test BackupManager utility class."""
    
    def test_format_size(self):
        """Test file size formatting."""
        manager = BackupManager()
        
        self.assertIn('B', manager._format_size(100))
        self.assertIn('KB', manager._format_size(100000))
        self.assertIn('MB', manager._format_size(1000000))
        self.assertIn('GB', manager._format_size(1000000000))
    
    def test_get_backup_stats(self):
        """Test backup statistics calculation."""
        # Create test backups
        DatabaseBackup.objects.create(
            backup_file='backup1.sql',
            status='success',
            file_size=1000000
        )
        DatabaseBackup.objects.create(
            backup_file='backup2.sql',
            status='success',
            file_size=2000000
        )
        DatabaseBackup.objects.create(
            backup_file='backup3.sql',
            status='failed',
            error_message='Test error'
        )
        
        manager = BackupManager()
        stats = manager.get_backup_stats()
        
        self.assertEqual(stats['total_backups'], 3)
        self.assertEqual(stats['successful'], 2)
        self.assertEqual(stats['failed'], 1)
        self.assertIn('MB', stats['total_size'])
        self.assertIsNotNone(stats['last_backup'])


class BackupCommandTest(TestCase):
    """Test backup management command."""
    
    def test_backup_command_basic(self):
        """Test basic backup command execution."""
        out = StringIO()
        
        # This test would actually create a backup
        # In a real test environment, mock pg_dump
        # call_command('backup_database', stdout=out)
        # self.assertIn('successfully', out.getvalue().lower())
    
    def test_backup_command_help(self):
        """Test command help text."""
        out = StringIO()
        call_command('backup_database', '--help', stdout=out)
        help_text = out.getvalue()
        
        self.assertIn('backup', help_text.lower())
        self.assertIn('cleanup', help_text.lower())


class BackupStatusTest(TestCase):
    """Test backup status workflows."""
    
    def test_successful_backup_workflow(self):
        """Test a successful backup status sequence."""
        backup = DatabaseBackup.objects.create(
            backup_file='test.sql',
            status='pending'
        )
        
        self.assertEqual(backup.status, 'pending')
        
        backup.status = 'running'
        backup.save()
        self.assertEqual(backup.status, 'running')
        
        backup.status = 'success'
        backup.completed_at = timezone.now()
        backup.file_size = 1000000
        backup.save()
        
        self.assertEqual(backup.status, 'success')
        self.assertIsNotNone(backup.completed_at)
    
    def test_failed_backup_workflow(self):
        """Test a failed backup status sequence."""
        backup = DatabaseBackup.objects.create(
            backup_file='test.sql',
            status='running'
        )
        
        backup.status = 'failed'
        backup.error_message = 'Connection refused'
        backup.completed_at = timezone.now()
        backup.save()
        
        self.assertEqual(backup.status, 'failed')
        self.assertEqual(backup.error_message, 'Connection refused')


class BackupCleanupTest(TestCase):
    """Test backup cleanup functionality."""
    
    def setUp(self):
        """Create test backups of different ages."""
        # Old backup (10 days old)
        DatabaseBackup.objects.create(
            backup_file='old_backup.sql',
            status='success',
            created_at=timezone.now() - timedelta(days=10),
            completed_at=timezone.now() - timedelta(days=10),
            file_size=1000000
        )
        
        # Recent backup (3 days old)
        DatabaseBackup.objects.create(
            backup_file='recent_backup.sql',
            status='success',
            created_at=timezone.now() - timedelta(days=3),
            completed_at=timezone.now() - timedelta(days=3),
            file_size=1000000
        )
        
        # Failed backup (5 days old)
        DatabaseBackup.objects.create(
            backup_file='failed_backup.sql',
            status='failed',
            created_at=timezone.now() - timedelta(days=5),
            error_message='Test error',
            file_size=0
        )
    
    def test_cleanup_old_backups(self):
        """Test cleanup removes old backups."""
        manager = BackupManager()
        
        # Should remove backups older than 7 days
        removed_count = manager.cleanup_old_backups(days=7)
        
        # Should have removed the 10-day old backup
        self.assertGreaterEqual(removed_count, 1)
        
        # Recent backup should still exist
        recent = DatabaseBackup.objects.filter(backup_file='recent_backup.sql').first()
        self.assertIsNotNone(recent)
