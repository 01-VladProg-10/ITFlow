# notifications/urls.py
from django.urls import path
from .views import ContactMessageCreateView
from .tests import send_test_email

urlpatterns = [
    path('contact/', ContactMessageCreateView.as_view(), name='contact-create'),
    path('test-email/', send_test_email, name='test-email'),
]
