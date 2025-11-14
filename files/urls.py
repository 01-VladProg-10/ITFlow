from django.urls import path
from .views import files_list_api

urlpatterns = [
    path('all-files/', files_list_api, name='files-list-api'),
]
