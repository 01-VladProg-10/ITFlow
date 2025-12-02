from django.urls import path
from .views import (
    ContactMessageCreateView,
    ContactMessageRespondView,
    ContactMessageListView,
    ContactMessageDetailView,
    ContactMessageFilteredListView,
    ContactMessageDeleteView,
    ContactMessageStatsView,
)
from .tests import send_test_email

app_name = "notifications"

urlpatterns = [
    # Klient wysyła wiadomość kontaktową
    path('contact/', ContactMessageCreateView.as_view(), name='contact-create'),

    # Manager odpowiada na wiadomość
    path('contact/<int:pk>/respond/', ContactMessageRespondView.as_view(), name='contact-respond'),

    # Lista wszystkich zgłoszeń (tylko manager)
    path('contact/all/', ContactMessageListView.as_view(), name='contact-list'),

    # Szczegóły jednej wiadomości
    path('contact/<int:pk>/', ContactMessageDetailView.as_view(), name='contact-detail'),

    # Filtrowanie zgłoszeń po statusie
    path('contact/filter/', ContactMessageFilteredListView.as_view(), name='contact-filtered-list'),

    # Usuwanie wiadomości
    path('contact/<int:pk>/delete/', ContactMessageDeleteView.as_view(), name='contact-delete'),

    # Statystyki zgłoszeń
    path('contact/stats/', ContactMessageStatsView.as_view(), name='contact-stats'),

    # Test wysyłki maila
    path('test-email/', send_test_email, name='test-email'),
]
