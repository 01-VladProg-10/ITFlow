from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import OrderLog
from .serializers import OrderLogSerializer

class OrderLogViewSet(viewsets.ReadOnlyModelViewSet):
        queryset = OrderLog.objects.all().order_by("timestamp")
        serializer_class = OrderLogSerializer
        permission_classes = [IsAuthenticated]

        # ZMIANA: Usuń ukośnik z grupy przechwytującej w url_path
        @action(detail=False, methods=["get"], url_path=r"order-history/(?P<order_id>\d+)")
        def order_history(self, request, order_id=None):
            """
            Oczekiwany URL: /order-log/order-history/<order_id>/
            """
            # Sprawdzamy czy order_id jest liczbą (dzięki \d+)
            logs = OrderLog.objects.filter(order_id=order_id).order_by("timestamp")
            serializer = OrderLogSerializer(logs, many=True)
            return Response(serializer.data)
