from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import Group
from .models import User
from .serializers import UserSerializer, GroupSerializer
import logging

logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action in ['register']:
            return [AllowAny()]
        return [IsAuthenticated()]


    # ---------------------------------------------------------
    #      МЕТОД: /users/register — логирование + валидация
    # ---------------------------------------------------------

    @action(detail=False, methods=['post'])
    def register(self, request):
        """
        Rejestracja nowego użytkownika.
        Grupa 'client' zostanie przypisana automatycznie przez sygnał post_save.
        """
        logger.info(
            "User registration attempt",
            extra={
                "username": request.data.get("username"),
                "email": request.data.get("email"),
                "ip": request.META.get("REMOTE_ADDR")
            }
        )
        serializer = self.get_serializer(data=request.data)
        
        # Валидация с логированием ошибки
        if not serializer.is_valid():
            logger.warning(
                "User registration failed (validation error)",
                extra={"errors": serializer.errors}
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Сохранение пользователя

        user = serializer.save()
        logger.info(
            "User registered successfully",
            extra={"user_id": user.id}
        )

        return Response(
            {
                'message': 'User created successfully (assigned to "client" group automatically).',
                'user': UserSerializer(user).data
            },
            status=status.HTTP_201_CREATED
        )


 # ---------------------------------------------------------
    #       МЕТОД: /users/me — логирование + возврат данных
    # ---------------------------------------------------------


    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):

        logger.debug(
            "Fetching current user profile",
            extra={"user_id": request.user.id}
        )

        """Zwraca dane aktualnie zalogowanego użytkownika."""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class GroupViewSet(viewsets.ReadOnlyModelViewSet):
    """Widok tylko do odczytu listy grup (dla administratorów lub managerów)."""
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
