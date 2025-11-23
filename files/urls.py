# files/urls.py

from django.urls import path
from .views import files_list_api, upload_file_api

urlpatterns = [
    path('all-files/', files_list_api, name='files-list-api'),
    path('upload/', upload_file_api, name='files-upload-api'),
]