from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import Group
from .models import User
from orders.models import Order
from orders.serializers import OrderSerializer
from .serializers import UserSerializer, GroupSerializer


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['register']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Zwraca dane aktualnie zalogowanego użytkownika."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def register(self, request):
        """
        Rejestracja nowego użytkownika.
        Grupa 'client' zostanie przypisana automatycznie przez sygnał post_save.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'message': 'User created successfully (assigned to "client" group automatically).',
                'user': UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dashboard(self, request):
        """Zwraca dane użytkownika, jego grupy i najnowsze zamówienie."""
        user = request.user
        user_data = self.get_serializer(user).data

        # grupy użytkownika
        groups = [group.name for group in user.groups.all()]

        # najnowsze zamówienie
        latest_order = Order.objects.filter(client=request.user).order_by('-created_at').first()
        order_data = OrderSerializer(latest_order).data if latest_order else None

        return Response({
            'user': user_data,
            'groups': groups,
            'latest_order': order_data
        })


class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    """Widok tylko do odczytu listy grup (dla administratorów lub managerów)."""
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
