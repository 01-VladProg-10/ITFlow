"""
Example configuration for the backup system.
Add these settings to your settings.py if you want to customize behavior.
"""

# =====================================================================
# BACKUP SYSTEM CONFIGURATION (Optional - defaults are sensible)
# =====================================================================

# Backup directory path (relative to BASE_DIR)
# Default: BASE_DIR / 'backups' / 'data'
# BACKUP_DIR = BASE_DIR / 'backups' / 'data'

# Number of days to keep backups before cleanup
# Default: 7 days
# BACKUP_RETENTION_DAYS = 7

# Backup interval for scheduler (in hours)
# Default: 48 hours (every 2 days)
# Note: Change this in backups/scheduler.py if you want to modify it
# BACKUP_INTERVAL_HOURS = 48

# Cleanup interval for scheduler (in days)
# Default: 7 days (weekly)
# Note: Change this in backups/scheduler.py if you want to modify it
# BACKUP_CLEANUP_INTERVAL_DAYS = 7

# Enable/disable backup scheduler (True = auto-backups enabled)
# Default: True
# BACKUP_SCHEDULER_ENABLED = True

# PostgreSQL pg_dump timeout (in seconds)
# Default: 3600 (1 hour)
# BACKUP_TIMEOUT_SECONDS = 3600

# =====================================================================
# ENVIRONMENT VARIABLES (Set in .env file)
# =====================================================================

# These are already configured in settings.py via os.getenv():
# POSTGRES_DB=itflow           # Database name
# POSTGRES_USER=itflow         # Database user
# POSTGRES_PASSWORD=itflow     # Database password
# POSTGRES_HOST=localhost      # Database host
# POSTGRES_PORT=5433          # Database port

# =====================================================================
# EXAMPLE CRON CONFIGURATION (Alternative to APScheduler)
# =====================================================================

# If you prefer cron jobs instead of APScheduler:
# 
# 1. Disable APScheduler in backups/apps.py
# 2. Add to crontab (crontab -e):
#
# # Run backup every 48 hours at 2 AM (every other day)
# 0 2 */2 * * /path/to/venv/bin/python /path/to/manage.py backup_database --cleanup
#
# # Or simpler: backup every 2 days at 2 AM
# 0 2 1-31/2 * * /path/to/venv/bin/python /path/to/manage.py backup_database --cleanup
#
# # Run cleanup weekly on Sunday at 3 AM
# 0 3 * * 0 /path/to/venv/bin/python /path/to/manage.py backup_database --cleanup-only --cleanup-days 7
#

# =====================================================================
# MONITORING AND ALERTS
# =====================================================================

# You can monitor backup status by checking:
#
# 1. Django Admin:
#    http://localhost:8000/admin/backups/databasebackup/
#
# 2. REST API:
#    GET /api/backups/stats/
#    GET /api/backups/scheduler-status/
#
# 3. Database:
#    SELECT * FROM backups_databasebackup ORDER BY created_at DESC;
#
# 4. Logs:
#    tail -f logs/application.log | grep backups
#

# =====================================================================
# USEFUL COMMANDS
# =====================================================================

# Create manual backup
# python manage.py backup_database

# Create backup + cleanup old ones
# python manage.py backup_database --cleanup

# Only cleanup without creating backup
# python manage.py backup_database --cleanup-only

# Keep backups for 14 days instead of 7
# python manage.py backup_database --cleanup --cleanup-days 14

# Access Django shell to inspect backups
# python manage.py shell
# >>> from backups.models import DatabaseBackup
# >>> DatabaseBackup.objects.all()

# View all successful backups
# >>> DatabaseBackup.objects.filter(status='success').order_by('-created_at')
