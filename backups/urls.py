"""
URL configuration for backup API endpoints.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DatabaseBackupViewSet

router = DefaultRouter()
router.register(r'', DatabaseBackupViewSet, basename='backup')

urlpatterns = [
    path('', include(router.urls)),
]
