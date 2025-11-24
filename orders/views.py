<<<<<<< HEAD
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, viewsets
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model

from orders.models import Order
from orders.serializers import OrderSerializer

User = get_user_model()

=======
# orders/views.py
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model

from .models import Order
from .serializers import OrderSerializer
>>>>>>> 2166394907cc6fa51918a94b8d28d1a5a3a3b9ed

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

<<<<<<< HEAD
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def assign(self, request, pk=None):
        """
        Manager przydziela zadanie developerowi.
        Payload JSON:
        {
            "developer_id": 5
        }
        """
=======
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create_order(self, request):
        """Dedykowany endpoint POST /orders/create/"""
        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def assign(self, request, pk=None):
        """Przydzielanie zamówienia developerowi (tylko manager)"""
>>>>>>> 2166394907cc6fa51918a94b8d28d1a5a3a3b9ed
        user = request.user
        if 'manager' not in user.groups.values_list('name', flat=True):
            return Response({'detail': 'Only managers can assign tasks.'}, status=status.HTTP_403_FORBIDDEN)

        order = self.get_object()
        developer_id = request.data.get('developer_id')

        try:
            developer = User.objects.get(pk=developer_id)
        except User.DoesNotExist:
            return Response({'detail': 'Developer not found.'}, status=status.HTTP_400_BAD_REQUEST)

        if 'developer' not in developer.groups.values_list('name', flat=True):
            return Response({'detail': 'Assigned user is not a developer.'}, status=status.HTTP_400_BAD_REQUEST)

        order.developer = developer
        order.save()
<<<<<<< HEAD

        return Response({'detail': f'Task assigned to {developer.username}.'})
=======
        return Response({'detail': f'Task assigned to {developer.username}.'})
>>>>>>> 2166394907cc6fa51918a94b8d28d1a5a3a3b9ed
