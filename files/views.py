# files/views.py
from rest_framework.decorators import api_view, permission_classes, parser_classes, authentication_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.http import HttpResponse  # Zmieniamy na HttpResponse
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import File
from .serializers import FileSerializer
import boto3, os, io  # Dodano io
import zipfile  # Dodano zipfile
from django.shortcuts import get_object_or_404  # Dodano get_object_or_404
from django.db.models import Q  # Dodano Q do złożonych zapytań

CLOUDFLARE_R2_ENDPOINT = os.getenv("CLOUDFLARE_R2_ENDPOINT")
CLOUDFLARE_R2_BUCKET = os.getenv("CLOUDFLARE_R2_BUCKET_NAME")
CLOUDFLARE_R2_KEY = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID")
CLOUDFLARE_R2_SECRET = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
CLOUDFLARE_PUBLIC_URL = os.getenv("CLOUDFLARE_PUBLIC_URL")


# Inicjalizacja klienta S3 dla Cloudflare R2
def get_r2_client():
    session = boto3.session.Session()
    return session.client(
        's3',
        endpoint_url=CLOUDFLARE_R2_ENDPOINT,
        aws_access_key_id=CLOUDFLARE_R2_KEY,
        aws_secret_access_key=CLOUDFLARE_R2_SECRET
    )


def upload_to_r2(file_obj):
    s3 = get_r2_client()
    # ... (kod bez zmian) ...
    file_key = f"uploads/{file_obj.name}"
    s3.upload_fileobj(file_obj, CLOUDFLARE_R2_BUCKET, file_key)
    return f"{CLOUDFLARE_PUBLIC_URL.rstrip('/')}/{file_key}"


# --- Istniejące funkcje (files_list_api, files_by_order_api, upload_file_api, file_detail_api, update_visible_to_clients_api) ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def files_list_api(request):
    user = request.user
    queryset = File.objects.all()
    if user.groups.filter(name='Client').exists():
        queryset = queryset.filter(visible_to_clients=True)
    serializer = FileSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def files_by_order_api(request, order_id):
    user = request.user
    queryset = File.objects.filter(order_id=order_id)
    if user.groups.filter(name='Client').exists():
        queryset = queryset.filter(visible_to_clients=True)
    serializer = FileSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_file_api(request):
    uploaded_file = request.FILES.get('uploaded_file')
    if not uploaded_file:
        return Response({"uploaded_file": "This field is required."}, status=400)

    cloud_url = upload_to_r2(uploaded_file)
    data = {
        'name': request.data.get('name'),
        'file_type': request.data.get('file_type'),
        'description': request.data.get('description'),
        'order': request.data.get('order'),
        'visible_to_clients': request.data.get('visible_to_clients', False),
        'uploaded_file_url': cloud_url,
        'uploaded_by': request.user.id
    }

    serializer = FileSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)

    return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def file_detail_api(request, pk):
    try:
        file_obj = File.objects.get(pk=pk)
    except File.DoesNotExist:
        return Response({"detail": "Nie znaleziono pliku."}, status=404)

    user = request.user
    if user.groups.filter(name='Client').exists() and not file_obj.visible_to_clients:
        return Response({"detail": "Brak dostępu."}, status=403)

    serializer = FileSerializer(file_obj, context={'request': request})
    return Response(serializer.data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_visible_to_clients_api(request, pk):
    try:
        file_obj = File.objects.get(pk=pk)
    except File.DoesNotExist:
        return Response({"detail": "Plik nie istnieje."}, status=404)

    visible = request.data.get("visible_to_clients")
    if visible is None:
        return Response({"visible_to_clients": "This field is required."}, status=400)

    file_obj.visible_to_clients = bool(visible)
    file_obj.save()
    return Response({"detail": "Zmieniono widoczność.", "visible_to_clients": file_obj.visible_to_clients}, status=200)


# ---------------------------------------------------------------------------------------------------
# NOWA FUNKCJA: Obsługa pobierania wielu plików jako ZIP
@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def download_files_api(request, order_id):
    """
    Pobiera wybrane pliki z danego zamówienia i pakuje je do ZIP-a.
    Endpoint: /api/orders/<order_id>/files/download/?file_ids=1,2,3
    """
    user = request.user

    # 1. Pobierz ID plików z parametrów zapytania
    file_ids_str = request.query_params.get('file_ids')
    if not file_ids_str:
        return Response({'detail': 'Wymagany parametr file_ids.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        file_ids = [int(id_str.strip()) for id_str in file_ids_str.split(',')]
    except ValueError:
        return Response({'detail': 'Nieprawidłowy format file_ids.'}, status=status.HTTP_400_BAD_REQUEST)

    # 2. Filtrowanie plików i walidacja dostępu

    # Upewniamy się, że pliki należą do zamówienia o podanym ID
    queryset = File.objects.filter(id__in=file_ids, order_id=order_id)

    # Warunki dostępu:
    # - Developer/Manager widzi wszystkie.
    # - Klient widzi tylko pliki oznaczone jako visible_to_clients=True
    is_client = user.groups.filter(name='Client').exists()

    if is_client:
        # Jeśli jest klientem, filtrujemy, aby zobaczył tylko widoczne pliki
        queryset = queryset.filter(visible_to_clients=True)

    if not queryset.exists():
        return Response({'detail': 'Nie znaleziono plików do pobrania lub brak uprawnień.'},
                        status=status.HTTP_404_NOT_FOUND)

    # 3. Dynamiczne tworzenie archiwum ZIP w pamięci
    s3 = get_r2_client()
    zip_buffer = io.BytesIO()

    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_obj in queryset:
            try:
                # Klucz pliku w R2 (usuwamy publiczny URL, pozostawiamy ścieżkę)
                # Zakładamy, że format URL to CLOUDFLARE_PUBLIC_URL/uploads/{file_name}
                file_key_path = file_obj.uploaded_file_url.replace(f"{CLOUDFLARE_PUBLIC_URL.rstrip('/')}/", '')

                # Pobierz plik z R2
                r2_object = s3.get_object(Bucket=CLOUDFLARE_R2_BUCKET, Key=file_key_path)
                file_content = r2_object['Body'].read()

                # Dodaj do ZIP-a z oryginalną nazwą i rozszerzeniem
                zip_file.writestr(f"{file_obj.name}.{file_obj.file_type}", file_content)

            except Exception as e:
                # Logowanie błędu i kontynuowanie z następnym plikiem
                print(f"Błąd pobierania pliku {file_obj.name} z R2: {e}")

    # Przygotowanie odpowiedzi HTTP
    response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
    response['Content-Disposition'] = f'attachment; filename="order_{order_id}_files.zip"'
    response['Content-Length'] = zip_buffer.tell()

    return response
