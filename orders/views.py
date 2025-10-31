from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Order
from .serializers import OrderSerializer

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'manager']
    ordering_fields = ['created_at', 'updated_at']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'manager':
            # manager widzi wszystkie zgłoszenia
            return Order.objects.all()
        elif user.role == 'developer':
            # developer widzi tylko przypisane do siebie
            return Order.objects.filter(developer=user)
        else:  # client
            # klient widzi tylko swoje zgłoszenia
            return Order.objects.filter(client=user)

    def create(self, request, *args, **kwargs):
        # przy tworzeniu order automatycznie przypisujemy clienta
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(client=request.user)
        return Response(
            {"message": "Order created successfully", "order": serializer.data},
            status=status.HTTP_201_CREATED
        )
