"""
files/permissions.py

Custom permission definitions for file management.
This module enforces role-based access control (RBAC) for file operations
within the system, ensuring that only authorized users can create, view,
or delete files based on their group membership and file visibility.
"""

from rest_framework import permissions

# ---------------------------------------------------------------------
# FilePermission
# ---------------------------------------------------------------------
class FilePermission(permissions.BasePermission):
    """
    Role-based permissions for File model operations:

    - Programmer: can create/upload files.
    - Manager: can create/upload files and mark them visible to clients.
    - Client: can only view files that are marked as visible_to_clients.
    - All authenticated users: can delete files (optional policy, configurable).
    """

    # -----------------------------------------------------------------
    # General permission check for the request
    # -----------------------------------------------------------------
    def has_permission(self, request, view):
        """
        Determines whether the user has permission to perform the requested
        action at the view level (create, list, retrieve, destroy).

        Args:
            request (Request): DRF request object
            view (View): DRF view object

        Returns:
            bool: True if permitted, False otherwise
        """
        user = request.user

        # Deny access if user is not authenticated
        if not user.is_authenticated:
            return False

        # Allow creation only for Programmer or Manager groups
        if view.action == 'create':
            return user.groups.filter(name__in=['programmer', 'manager']).exists()

        # Allow listing and retrieving; object-level checks will handle visibility
        if view.action in ['list', 'retrieve']:
            return True

        # Allow deletion for all authenticated users (policy can be customized)
        if view.action == 'destroy':
            return True

        # Deny any other actions by default
        return False

    # -----------------------------------------------------------------
    # Object-level permission check
    # -----------------------------------------------------------------
    def has_object_permission(self, request, view, obj):
        """
        Determines whether the user has permission to perform the action
        on a specific File instance.

        Args:
            request (Request): DRF request object
            view (View): DRF view object
            obj (File): File instance being accessed

        Returns:
            bool: True if permitted, False otherwise
        """
        user = request.user

        # Viewing permissions for Client group
        if view.action in ['retrieve', 'list']:
            if user.groups.filter(name='client').exists():
                # Clients can only view files marked as visible
                return obj.visible_to_clients
            # All other roles can view any file
            return True

        # Deletion is allowed for all authenticated users (policy can be changed)
        if view.action == 'destroy':
            return True

        # Default deny for any other object-level actions
        return False
