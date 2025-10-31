from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet

# Tworzymy router DRF
router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
]