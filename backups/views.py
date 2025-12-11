"""
REST API views for backup management.
Provides endpoints to trigger backups and view backup history.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from .models import DatabaseBackup
from .serializers import DatabaseBackupSerializer
from .backup_utils import BackupManager
from .scheduler import get_scheduler_status
import logging

logger = logging.getLogger(__name__)


class DatabaseBackupViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for database backup management.
    
    Endpoints:
    - GET /api/backups/ - List all backups
    - GET /api/backups/{id}/ - Get backup details
    - POST /api/backups/create-backup/ - Trigger manual backup
    - POST /api/backups/cleanup/ - Trigger cleanup
    - GET /api/backups/stats/ - Get backup statistics
    - GET /api/backups/scheduler-status/ - Get scheduler status
    """
    
    queryset = DatabaseBackup.objects.all()
    serializer_class = DatabaseBackupSerializer
    permission_classes = [IsAdminUser]
    filterset_fields = ['status', 'created_at']
    ordering_fields = ['created_at', 'file_size', 'status']
    ordering = ['-created_at']
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def create_backup(self, request):
        """
        Manually trigger a database backup.
        
        Returns:
            Backup creation status and details
        """
        try:
            manager = BackupManager()
            backup = manager.create_backup()
            
            return Response(
                {
                    'success': True,
                    'message': 'Backup created successfully',
                    'backup': DatabaseBackupSerializer(backup).data
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Manual backup failed: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def cleanup(self, request):
        """
        Manually trigger backup cleanup.
        
        Query Parameters:
            days (int): Number of days of backups to keep (default: 7)
        
        Returns:
            Cleanup status and count of removed backups
        """
        try:
            days = int(request.query_params.get('days', 7))
            manager = BackupManager()
            count = manager.cleanup_old_backups(days=days)
            
            return Response(
                {
                    'success': True,
                    'message': f'Cleanup completed',
                    'backups_removed': count,
                    'kept_days': days
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Cleanup failed: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def stats(self, request):
        """
        Get backup statistics and information.
        
        Returns:
            Backup statistics including counts and sizes
        """
        try:
            manager = BackupManager()
            stats = manager.get_backup_stats()
            
            return Response(
                {
                    'success': True,
                    'data': stats
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Failed to get stats: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def scheduler_status(self, request):
        """
        Get backup scheduler status and scheduled jobs.
        
        Returns:
            Scheduler running status and job information
        """
        try:
            status_info = get_scheduler_status()
            
            return Response(
                {
                    'success': True,
                    'data': status_info
                },
                status=status.HTTP_200_OK
            )
        except Exception as e:
            logger.error(f"Failed to get scheduler status: {str(e)}")
            return Response(
                {
                    'success': False,
                    'error': str(e)
                },
                status=status.HTTP_400_BAD_REQUEST
            )
