from rest_framework import generics, status
from rest_framework.permissions import AllowAny, BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from .models import ContactMessage
from .serializers import ContactMessageSerializer

# === Permission dla managerów ===
class IsManager(BasePermission):
    """
    Pozwala na dostęp tylko użytkownikom należącym do grupy 'manager'.
    """
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.groups.filter(name="manager").exists()
        )

# === Widok dla klienta ===
class ContactMessageCreateView(generics.CreateAPIView):
    """
    Klient wysyła wiadomość kontaktową.
    """
    serializer_class = ContactMessageSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        contact_message = serializer.save()
        return Response(
            {
                "message": "✅ Wiadomość została wysłana pomyślnie!",
                "data": ContactMessageSerializer(contact_message).data
            },
            status=status.HTTP_201_CREATED
        )

# === Widok dla managera: odpowiedź na wiadomość ===
class ContactMessageRespondView(APIView):
    """
    Manager dopisuje odpowiedź i ustawia is_answered=True.
    """
    permission_classes = [IsManager]

    def post(self, request, pk):
        try:
            contact_message = ContactMessage.objects.get(pk=pk)
        except ContactMessage.DoesNotExist:
            return Response({"error": "Wiadomość nie istnieje"}, status=status.HTTP_404_NOT_FOUND)

        response_text = request.data.get("response_message")
        if not response_text:
            return Response({"error": "Brak wiadomości odpowiedzi"}, status=status.HTTP_400_BAD_REQUEST)

        contact_message.response_message = response_text
        contact_message.is_answered = True
        contact_message.save()

        return Response(
            {
                "message": "✅ Odpowiedź została dodana",
                "data": ContactMessageSerializer(contact_message).data
            },
            status=status.HTTP_200_OK
        )

# === Widok dla managera: lista wszystkich zgłoszeń ===
class ContactMessageListView(generics.ListAPIView):
    """
    Zwraca listę wszystkich zgłoszeń kontaktowych.
    Dostęp tylko dla managerów.
    """
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [IsManager]

# === Widok: pobranie szczegółów jednej wiadomości ===
class ContactMessageDetailView(generics.RetrieveAPIView):
    """
    Pobiera szczegóły pojedynczej wiadomości.
    """
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.request.user.is_authenticated and self.request.user.groups.filter(name="manager").exists():
            return [IsManager()]
        return [AllowAny()]

    def get_object(self):
        obj = super().get_object()
        if not self.request.user.groups.filter(name="manager").exists():
            if obj.email != self.request.user.email:
                raise PermissionDenied("Nie masz dostępu do tej wiadomości")
        return obj

# === Widok: filtrowanie po statusie is_answered ===
class ContactMessageFilteredListView(generics.ListAPIView):
    """
    Filtrowanie zgłoszeń po statusie is_answered.
    Query param: ?is_answered=true/false
    """
    serializer_class = ContactMessageSerializer
    permission_classes = [IsManager]

    def get_queryset(self):
        queryset = ContactMessage.objects.all().order_by('-created_at')
        is_answered = self.request.query_params.get('is_answered')
        if is_answered is not None:
            if is_answered.lower() == 'true':
                queryset = queryset.filter(is_answered=True)
            elif is_answered.lower() == 'false':
                queryset = queryset.filter(is_answered=False)
        return queryset

# === Widok: usuwanie wiadomości (manager) ===
class ContactMessageDeleteView(generics.DestroyAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    permission_classes = [IsManager]

# === Widok: statystyki zgłoszeń ===
class ContactMessageStatsView(APIView):
    permission_classes = [IsManager]

    def get(self, request):
        total = ContactMessage.objects.count()
        answered = ContactMessage.objects.filter(is_answered=True).count()
        unanswered = total - answered
        return Response({
            "total": total,
            "answered": answered,
            "unanswered": unanswered
        })
