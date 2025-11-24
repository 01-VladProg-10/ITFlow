from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
import logging

from nortifications.serializers import ContactMessageSerializer

logger = logging.getLogger(__name__)  # <-- будет резолвиться в 'nortifications'

class ContactMessageCreateView(generics.CreateAPIView):
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        logger.info("Incoming contact message", extra={
            "ip": request.META.get("REMOTE_ADDR"),
            "data_preview": {
                "name": request.data.get("name"),
                "email": request.data.get("email"),
                "subject": request.data.get("subject"),
            }
        })

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save()

        logger.info("Contact message saved", extra={"id": instance.id})

        return Response(
            {"message": "✅ Wiadomość została wysłana pomyślnie!"},
            status=status.HTTP_201_CREATED
        )