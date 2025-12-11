# orderLog/urls.py
from rest_framework.routers import DefaultRouter
from .views import OrderLogViewSet

router = DefaultRouter()
# ZMIANA NA LEPSZĄ PRAKTYKĘ: Rejestrujemy pod pustym stringiem
# Cała ścieżka bazowa jest już zdefiniowana w głównym urls.py jako 'order-log/'
router.register(r'', OrderLogViewSet, basename='order-log') 

urlpatterns = router.urls