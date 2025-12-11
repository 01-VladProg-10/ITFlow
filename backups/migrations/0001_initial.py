"""
Initial migration for DatabaseBackup model.
"""
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='DatabaseBackup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('backup_file', models.CharField(help_text='Backup filename', max_length=255)),
                ('file_size', models.BigIntegerField(blank=True, help_text='Size in bytes', null=True)),
                ('status', models.CharField(choices=[('pending', 'Pending'), ('running', 'Running'), ('success', 'Success'), ('failed', 'Failed'), ('cleaned', 'Cleaned Up')], default='pending', help_text='Backup operation status', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='When backup was created')),
                ('completed_at', models.DateTimeField(blank=True, help_text='When backup completed', null=True)),
                ('error_message', models.TextField(blank=True, help_text='Error details if failed')),
                ('backup_path', models.CharField(blank=True, help_text='Full path to backup file', max_length=512)),
            ],
            options={
                'verbose_name': 'Database Backup',
                'verbose_name_plural': 'Database Backups',
            },
        ),
        migrations.AddIndex(
            model_name='databasebackup',
            index=models.Index(fields=['-created_at'], name='backups_dat_created_idx'),
        ),
        migrations.AddIndex(
            model_name='databasebackup',
            index=models.Index(fields=['status'], name='backups_dat_status_idx'),
        ),
    ]
