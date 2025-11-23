from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import File
from .serializers import FileSerializer
import boto3
import os

# Cloudflare R2
CLOUDFLARE_R2_ENDPOINT = os.getenv("CLOUDFLARE_R2_ENDPOINT")
CLOUDFLARE_R2_BUCKET = os.getenv("CLOUDFLARE_R2_BUCKET_NAME")
CLOUDFLARE_R2_KEY = os.getenv("CLOUDFLARE_R2_ACCESS_KEY_ID")
CLOUDFLARE_R2_SECRET = os.getenv("CLOUDFLARE_R2_SECRET_ACCESS_KEY")
CLOUDFLARE_PUBLIC_URL = os.getenv("CLOUDFLARE_PUBLIC_URL")  # np. https://pub-xxxx.r2.dev

def upload_to_r2(file_obj):
    session = boto3.session.Session()
    s3 = session.client(
        's3',
        endpoint_url=CLOUDFLARE_R2_ENDPOINT,
        aws_access_key_id=CLOUDFLARE_R2_KEY,
        aws_secret_access_key=CLOUDFLARE_R2_SECRET
    )

    file_key = f"uploads/{file_obj.name}"  # folder w bucket
    s3.upload_fileobj(file_obj, CLOUDFLARE_R2_BUCKET, file_key)

    # upewniamy się, że nie ma podwójnego slasha
    base_url = CLOUDFLARE_PUBLIC_URL.rstrip('/')
    return f"{base_url}/{file_key}"


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def files_list_api(request):
    user = request.user
    queryset = File.objects.all()
    if user.groups.filter(name='Client').exists():
        queryset = queryset.filter(visible_to_clients=True)

    serializer = FileSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
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
        'uploaded_file_url': cloud_url
    }

    serializer = FileSerializer(data=data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)
