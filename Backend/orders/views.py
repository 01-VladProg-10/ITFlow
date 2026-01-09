# orders/views.py
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model

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
        elif 'programmer' in groups:
            return Order.objects.filter(developer=user).order_by('-created_at')
        else:
            return Order.objects.filter(client=user).order_by('-created_at')

    # ---------------------------------------------------------
    #                CREATE ORDER
    # ---------------------------------------------------------
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create_order(self, request):
        """POST /orders/create_order/"""
        if 'client' not in request.data:
            request.data['client'] = request.user.id

        serializer = OrderSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            order = serializer.save(client=request.user)

            # 🔥 LOG
            if hasattr(order, "log_event"):
                order.log_event(
                    user=request.user,
                    event_type="order_created",
                    description="Utworzono nowe zlecenie."
                )

            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # ---------------------------------------------------------
    #                ASSIGN DEVELOPER
    # ---------------------------------------------------------
    @action(detail=True, methods=['post'], url_path='assign-developer', permission_classes=[IsAuthenticated])
    def assign(self, request, pk=None):
        user = request.user

        if 'manager' not in user.groups.values_list('name', flat=True):
            return Response({'detail': 'Tylko managerowie mogą przydzielać zadania.'},
                            status=status.HTTP_403_FORBIDDEN)

        order = self.get_object()
        developer_id = request.data.get('developer') or request.data.get('developer_id')

        old_dev = order.developer.username if order.developer else "Brak"

        if developer_id is not None:
            try:
                developer = User.objects.get(pk=developer_id)
            except User.DoesNotExist:
                return Response({'developer': 'Developer o podanym ID nie został znaleziony.'},
                                status=status.HTTP_400_BAD_REQUEST)

            if 'programmer' not in developer.groups.values_list('name', flat=True):
                return Response({'developer': 'Wybrany użytkownik nie jest programmer.'},
                                status=status.HTTP_400_BAD_REQUEST)

            order.developer = developer
            new_dev = developer.username
        else:
            order.developer = None
            new_dev = "Brak"

        order.manager = user
        order.save()

        # 🔥 LOG
        if hasattr(order, "log_event"):
            order.log_event(
                user=user,
                event_type="assignment",
                description=f"Zmiana developera z {old_dev} na {new_dev}",
                old_value=old_dev,
                new_value=new_dev
            )

        serializer = OrderSerializer(order, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    # ---------------------------------------------------------
    #                CHANGE STATUS (FULL WORKFLOW)
    # ---------------------------------------------------------
    @action(detail=True, methods=['post'], url_path='change-status', permission_classes=[IsAuthenticated])
    def change_status(self, request, pk=None):
        order = self.get_object()
        user = request.user
        groups = list(user.groups.values_list('name', flat=True))

        new_status = request.data.get("status")
        allowed_statuses = dict(Order.STATUS_CHOICES).keys()

        if new_status not in allowed_statuses:
            return Response({"status": "Nieprawidłowy status."}, status=400)

        current = order.status

        transitions = {
            "manager": {
                "submitted": ["accepted", "rejected"],
                "client_review": ["awaiting_review"],
                "client_fix": ["rework_requested"],
                "awaiting_review": ["in_progress"],
            },
            "programmer": {
                "accepted": ["in_progress"],
                "in_progress": ["client_review"],
                "rework_requested": ["in_progress"],
            },
            "client": {
                "awaiting_review": ["done", "client_fix"],
            }
        }

        # ------------------------------------
        # MANAGER
        # ------------------------------------
        if "manager" in groups or user.is_staff:
            allowed = transitions["manager"].get(current, [])

            if new_status not in allowed and new_status != current:
                return Response(
                    {"detail": f"Manager: Nie można przejść z '{current}' na '{new_status}'."},
                    status=403
                )

            order.update_status_and_log(new_status, user)
            return Response(OrderSerializer(order).data, status=200)

        # ------------------------------------
        # PROGRAMMER
        # ------------------------------------
        if "programmer" in groups:
            if order.developer != user:
                return Response({"detail": "To zadanie nie jest przypisane do Ciebie."}, status=403)

            allowed = transitions["programmer"].get(current, [])

            if new_status not in allowed:
                return Response(
                    {"detail": f"Programista: Niedozwolona zmiana z '{current}' na '{new_status}'."},
                    status=403
                )

            order.update_status_and_log(new_status, user)
            return Response(OrderSerializer(order).data, status=200)

        # ------------------------------------
        # CLIENT
        # ------------------------------------
        if order.client == user:
            allowed = transitions["client"].get(current, [])

            if new_status not in allowed:
                return Response(
                    {"detail": f"Klient: Niedozwolona zmiana z '{current}' na '{new_status}'."},
                    status=403
                )

            order.update_status_and_log(new_status, user)
            return Response(OrderSerializer(order).data, status=200)

        return Response({"detail": "Brak uprawnień."}, status=403)