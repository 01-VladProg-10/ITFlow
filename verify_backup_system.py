#!/usr/bin/env python
"""
Backup System Verification Script
Checks if the backup system is properly installed and configured.

Usage:
    python verify_backup_system.py
"""

import os
import sys
import subprocess
from pathlib import Path


def check_file_exists(path, description):
    """Check if a file exists and report."""
    if os.path.exists(path):
        print(f"✅ {description}")
        return True
    else:
        print(f"❌ {description} - NOT FOUND: {path}")
        return False


def check_module_installed(module_name, description):
    """Check if a Python module is installed."""
    try:
        __import__(module_name)
        print(f"✅ {description}")
        return True
    except ImportError:
        print(f"❌ {description} - Not installed")
        return False


def check_command_exists(command, description):
    """Check if a command-line tool exists."""
    try:
        result = subprocess.run(
            [command, "--version"],
            capture_output=True,
            timeout=5
        )
        if result.returncode == 0:
            print(f"✅ {description}")
            return True
        else:
            print(f"❌ {description} - Not accessible")
            return False
    except (subprocess.TimeoutExpired, FileNotFoundError, OSError):
        print(f"❌ {description} - Not found or not accessible")
        return False


def main():
    """Run all verification checks."""
    print("\n" + "="*70)
    print("DATABASE BACKUP SYSTEM - VERIFICATION SCRIPT")
    print("="*70 + "\n")
    
    base_dir = Path(__file__).parent
    checks_passed = 0
    checks_total = 0
    
    # 1. Check application files
    print("📁 CHECKING APPLICATION FILES")
    print("-" * 70)
    
    app_files = [
        ("backups/__init__.py", "Backup app initialization"),
        ("backups/apps.py", "App configuration"),
        ("backups/models.py", "DatabaseBackup model"),
        ("backups/admin.py", "Django admin interface"),
        ("backups/views.py", "API views"),
        ("backups/serializers.py", "API serializers"),
        ("backups/urls.py", "URL configuration"),
        ("backups/backup_utils.py", "BackupManager utility"),
        ("backups/scheduler.py", "APScheduler integration"),
        ("backups/tests.py", "Unit tests"),
        ("backups/management/commands/backup_database.py", "Management command"),
        ("backups/migrations/0001_initial.py", "Database migration"),
    ]
    
    for file_path, description in app_files:
        full_path = base_dir / file_path
        if check_file_exists(full_path, description):
            checks_passed += 1
        checks_total += 1
    
    # 2. Check configuration changes
    print("\n⚙️  CHECKING CONFIGURATION")
    print("-" * 70)
    
    settings_file = base_dir / "ITFlow" / "settings.py"
    urls_file = base_dir / "ITFlow" / "urls.py"
    requirements_file = base_dir / "requirements.txt"
    
    checks_total += 1
    if check_file_exists(settings_file, "Settings file exists"):
        with open(settings_file, 'r') as f:
            content = f.read()
            if "'backups.apps.BackupsConfig'" in content:
                print("✅ Backups app added to INSTALLED_APPS")
                checks_passed += 1
            else:
                print("❌ Backups app NOT in INSTALLED_APPS")
    
    checks_total += 1
    if check_file_exists(urls_file, "URLs file exists"):
        with open(urls_file, 'r') as f:
            content = f.read()
            if "'api/backups/'" in content or "backups.urls" in content:
                print("✅ Backup URLs configured")
                checks_passed += 1
            else:
                print("❌ Backup URLs NOT configured")
    
    checks_total += 1
    if check_file_exists(requirements_file, "Requirements file exists"):
        with open(requirements_file, 'r') as f:
            content = f.read()
            if "APScheduler" in content:
                print("✅ APScheduler added to requirements")
                checks_passed += 1
            else:
                print("❌ APScheduler NOT in requirements")
    
    # 3. Check Python dependencies
    print("\n📦 CHECKING PYTHON DEPENDENCIES")
    print("-" * 70)
    
    dependencies = [
        ("django", "Django"),
        ("rest_framework", "Django REST Framework"),
        ("apscheduler", "APScheduler"),
        ("psycopg", "PostgreSQL adapter"),
    ]
    
    for module, description in dependencies:
        checks_total += 1
        if check_module_installed(module, description):
            checks_passed += 1
    
    # 4. Check system tools
    print("\n🔧 CHECKING SYSTEM TOOLS")
    print("-" * 70)
    
    checks_total += 1
    if check_command_exists("pg_dump", "PostgreSQL pg_dump tool"):
        checks_passed += 1
    else:
        print("   💡 Tip: Install PostgreSQL client tools")
        print("      - Windows: Add PostgreSQL bin/ directory to PATH")
        print("      - Linux: sudo apt-get install postgresql-client")
        print("      - macOS: brew install postgresql")
    
    # 5. Check documentation files
    print("\n📚 CHECKING DOCUMENTATION")
    print("-" * 70)
    
    doc_files = [
        ("BACKUP_QUICKSTART.md", "Quick start guide"),
        ("BACKUP_SYSTEM.md", "Complete documentation"),
        ("BACKUP_SETUP_CHECKLIST.md", "Setup verification checklist"),
        ("BACKUP_IMPLEMENTATION_SUMMARY.md", "Implementation summary"),
        ("README_BACKUP_SYSTEM.txt", "Overview and summary"),
    ]
    
    for file_path, description in doc_files:
        full_path = base_dir / file_path
        checks_total += 1
        if check_file_exists(full_path, description):
            checks_passed += 1
    
    # Summary
    print("\n" + "="*70)
    print("VERIFICATION SUMMARY")
    print("="*70)
    print(f"\nChecks Passed: {checks_passed}/{checks_total}")
    
    if checks_passed == checks_total:
        print("\n✅ ALL CHECKS PASSED! System is ready to use.")
        print("\n🚀 NEXT STEPS:")
        print("   1. python manage.py migrate backups")
        print("   2. python manage.py backup_database")
        print("   3. Check Django admin: http://localhost:8000/admin/backups/databasebackup/")
        return 0
    elif checks_passed >= checks_total - 3:
        print("\n⚠️  MOST CHECKS PASSED - Minor issues detected")
        print("   See failures above for details")
        return 1
    else:
        print("\n❌ SYSTEM NOT FULLY INSTALLED")
        print("   Please address the failures above")
        print("   Refer to BACKUP_SYSTEM.md for detailed setup instructions")
        return 2


if __name__ == "__main__":
    sys.exit(main())
