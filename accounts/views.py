# accounts/views.py
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
        # Dołączamy 'programmers', aby używać IsAuthenticated, jeśli nie jest wymagane AllowAny
        if self.action in ['register']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['get', 'put', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """
        GET: zwraca dane aktualnie zalogowanego użytkownika.
        PUT/PATCH: aktualizuje dane aktualnie zalogowanego użytkownika.
        """
        user = request.user

        if request.method in ['PUT', 'PATCH']:
            serializer = self.get_serializer(user, data=request.data, partial=(request.method == 'PATCH'))
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        # GET
        serializer = self.get_serializer(user)
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
        """
        Zwraca dane użytkownika, jego grupy oraz najnowsze zamówienie.
        """
        user = request.user
        user_data = self.get_serializer(user).data

        groups = [group.name for group in user.groups.all()]

        latest_order = Order.objects.filter(client=user).order_by('-created_at').first()
        order_data = OrderSerializer(latest_order).data if latest_order else None

        return Response({
            'user': user_data,
            'groups': groups,
            'latest_order': order_data
        })

    ## NOWY ENDPOINT: /api/users/programmers/
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def programmers(self, request):
        """
        Zwraca listę użytkowników należących do grupy 'programmer' (developerów).
        """
        try:
            # 1. Znajdź grupę 'programmer'
            programmer_group = Group.objects.get(name='programmer')
        except Group.DoesNotExist:
            return Response(
                {"detail": "Grupa 'programmer' nie istnieje."},
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Przefiltruj użytkowników należących do tej grupy
        programmers = User.objects.filter(groups=programmer_group)

        # 3. Zserializuj i zwróć dane
        # Używamy get_serializer() dla UserSerializer z konfiguracji ViewSetu
        serializer = self.get_serializer(programmers, many=True)
        return Response(serializer.data)


class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    """Widok tylko do odczytu listy grup."""
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]