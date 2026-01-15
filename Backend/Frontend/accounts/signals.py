"""
accounts/signals.py

Signal definitions for user group management and automatic role assignment.
This module ensures that required user groups exist and that new users
are automatically assigned to the default group.
"""

import logging
from django.db.models.signals import post_migrate, post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group, Permission
from .models import User


# Initialize module-level logger
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------
# Post-migrate signal handler
# ---------------------------------------------------------------------
@receiver(post_migrate)
def create_default_groups(sender, **kwargs):
    """
    Ensures that predefined user groups exist in the system.
    Executed automatically after database migrations.
    """
    default_groups = ["client", "manager", "programmer", "admin"]

    for name in default_groups:
        group, created = Group.objects.get_or_create(name=name)
        if created:
            logger.info("Created group: %s", name)
        else:
            logger.debug("Group '%s' already exists", name)

    # Assign all permissions to admin group
    try:
        admin_group = Group.objects.get(name="admin")
        admin_group.permissions.set(Permission.objects.all())
        logger.info("Assigned full permissions to 'admin' group")
    except Exception as exc:
        logger.warning("Failed to assign permissions to 'admin': %s", exc)


# ---------------------------------------------------------------------
# Post-save signal handler for user model
# ---------------------------------------------------------------------
@receiver(post_save, sender=User)
def assign_default_group(sender, instance, created, **kwargs):
    """
    Assigns the 'client' group to newly created users without a group.
    Triggered automatically after user creation.
    """
    if created and not instance.groups.exists():
        client_group, _ = Group.objects.get_or_create(name="client")
        instance.groups.add(client_group)
        logger.info("User '%s' assigned to default group 'client'", instance.username)
