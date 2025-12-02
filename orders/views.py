# orders/views.py
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404  # Dodano dla czystszej obsługi developer_id

from .models import Order
from .serializers import OrderSerializer

User = get_user_model()


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        groups = user.groups.values_list('name', flat=True)

        if 'manager' in groups:
            return Order.objects.all().order_by('-created_at')
        elif 'developer' in groups:
            return Order.objects.filter(developer=user).order_by('-created_at')
        else:
            return Order.objects.filter(client=user).order_by('-created_at')

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create_order(self, request):
        """Dedykowany endpoint POST /orders/create_order/"""
        # Upewniamy się, że klient jest ustawiony na zalogowanego użytkownika, jeśli nie jest managerem
        if 'client' not in request.data:
            request.data['client'] = request.user.id

        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(client=request.user)  # Zapisujemy, upewniając się, że client to zalogowany użytkownik
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='assign-developer', permission_classes=[IsAuthenticated])
    def assign(self, request, pk=None):
        """
        POST /orders/{id}/assign-developer/
        Przypisuje developera i ustawia zalogowanego Managera.
        """
        user = request.user
        if 'manager' not in user.groups.values_list('name', flat=True):
            return Response({'detail': 'Tylko managerowie mogą przydzielać zadania.'}, status=status.HTTP_403_FORBIDDEN)

        order = self.get_object()
        # Przyjmujemy 'developer' lub 'developer_id' (zgodnie z frontendem)
        developer_id = request.data.get('developer') or request.data.get('developer_id')

        # 1. Ustawienie developera
        if developer_id is not None:
            try:
                # Sprawdź, czy developer istnieje
                developer = User.objects.get(pk=developer_id)
            except User.DoesNotExist:
                return Response({'developer': 'Developer o podanym ID nie został znaleziony.'},
                                status=status.HTTP_400_BAD_REQUEST)

            # !!! KLUCZOWA POPRAWKA: Zmiana nazwy grupy z 'developer' na 'programmer'
            if 'programmer' not in developer.groups.values_list('name', flat=True):
                return Response({'developer': 'Wybrany użytkownik nie jest **programmer**.'},
                                status=status.HTTP_400_BAD_REQUEST)

            order.developer = developer
        else:
            # 2. Obsługa usuwania przypisania (developer_id jest None)
            order.developer = None

        # 3. Ustawienie zalogowanego Managera
        order.manager = user  # Zalogowany użytkownik jest managerem, który przydzielił zadanie

        order.save()

        # Zwracamy zaktualizowane zamówienie (OrderSerializer)
        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)