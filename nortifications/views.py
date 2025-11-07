from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from nortifications.serializers import ContactMessageSerializer


class ContactMessageCreateView(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Ответ пользователю
        return Response(
            {"message": "✅ Wiadomość została wysłana pomyślnie!"},
            status=status.HTTP_201_CREATED
        )