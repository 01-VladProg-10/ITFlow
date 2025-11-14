from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import File
from .serializers import FileSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def files_list_api(request):
    """
    Zwraca listę plików z URL do Cloudflare R2.

    - Client: widzi tylko pliki z visible_to_clients=True
    - Manager / Programmer: widzi wszystkie pliki
    """
    user = request.user
    queryset = File.objects.all()

    # Filtrowanie dla klienta
    if user.groups.filter(name='Client').exists():
        queryset = queryset.filter(visible_to_clients=True)

    # Serializacja z context=request, aby poprawnie generować URL
    serializer = FileSerializer(queryset, many=True, context={'request': request})

    # Zwracamy listę URLów do plików w R2
    files_urls = [file_data['uploaded_file_url'] for file_data in serializer.data]

    return Response({"files": files_urls})
