from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order
from .serializers import OrderSerializer


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'manager']
    ordering_fields = ['created_at', 'updated_at']

    def get_user_group(self, user):
        """Zwraca nazwę grupy użytkownika (np. 'manager', 'developer', 'client')."""
        if user.groups.exists():
            return user.groups.first().name.lower()  # zakładamy jedną grupę per user
        return None

    def get_queryset(self):
        user = self.request.user
        group = self.get_user_group(user)

        if group == 'manager':
            # Manager widzi wszystkie zgłoszenia
            return Order.objects.all()
        elif group == 'developer':
            # Developer widzi tylko przypisane do siebie
            return Order.objects.filter(developer=user)
        elif group == 'admin':
            # Admin widzi wszystko
            return Order.objects.all()
        elif group == 'client':
            # Klient widzi tylko swoje zgłoszenia
            return Order.objects.filter(client=user)
        else:
            # Brak grupy — nic nie widzi
            return Order.objects.none()

    def create(self, request, *args, **kwargs):
        user = request.user
        group = self.get_user_group(user)

        # 🚫 Tylko użytkownicy z grupy 'client' mogą tworzyć zlecenia
        if group != 'client':
            return Response(
                {"error": "Tylko użytkownicy z grupy 'client' mogą tworzyć zgłoszenia."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(client=request.user)
        return Response(
            {"message": "Order created successfully", "order": serializer.data},
            status=status.HTTP_201_CREATED
        )
