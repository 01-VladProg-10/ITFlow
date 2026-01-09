# files/urls.py

from django.urls import path
from .views import (
    files_list_api,
    file_detail_api,
    upload_file_api,
    files_by_order_api,
    update_visible_to_clients_api,
    download_files_api,
    generate_final_report_pdf_api,  # <--- DODANY IMPORT
)

urlpatterns = [
    path('all-files/', files_list_api, name='files-list-api'),
    path('upload/', upload_file_api, name='files-upload-api'),
    path('<int:pk>/', file_detail_api, name='files-detail-api'),
    path('order/<int:order_id>/', files_by_order_api, name='files-by-order-api'),
    path('<int:pk>/visibility/', update_visible_to_clients_api, name='file-visibility-api'),

    # -----------------------------------------------------------
    # Istniejący URL do pobierania wielu plików jako ZIP
    path(
        'order/<int:order_id>/download/',
        download_files_api,
        name='files-download-api'
    ),
    # -----------------------------------------------------------
    # NOWY URL do pobierania raportu PDF
    path(
        'order/<int:order_id>/final_report/',
        generate_final_report_pdf_api,
        name='order-final-report-pdf-api'
    ),
    # -----------------------------------------------------------
]