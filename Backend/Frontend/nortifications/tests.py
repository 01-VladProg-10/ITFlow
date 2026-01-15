from django.test import TestCase
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from .models import ContactMessage
from .serializers import ContactMessageSerializer

User = get_user_model()


class ContactMessageModelTest(TestCase):
    """Tests for ContactMessage model"""

    def setUp(self):
        self.message = ContactMessage.objects.create(
            first_name='Ivan',
            last_name='Petrov',
            email='ivan@example.com',
            request_message='I need help'
        )

    def test_contact_message_creation(self):
        """Test message creation"""
        self.assertEqual(self.message.first_name, 'Ivan')
        self.assertEqual(self.message.last_name, 'Petrov')
        self.assertEqual(self.message.email, 'ivan@example.com')
        self.assertEqual(self.message.request_message, 'I need help')
        self.assertFalse(self.message.is_answered)

    def test_contact_message_string_representation(self):
        """Test message string representation"""
        expected = "Ivan Petrov (ivan@example.com)"
        self.assertEqual(str(self.message), expected)

    def test_contact_message_default_is_answered(self):
        """Test default value for is_answered"""
        message = ContactMessage.objects.create(
            first_name='Test',
            last_name='User',
            email='test@example.com',
            request_message='Test message'
        )
        self.assertFalse(message.is_answered)

    def test_contact_message_ordering(self):
        """Test message ordering"""
        message1 = ContactMessage.objects.create(
            first_name='First',
            last_name='User',
            email='first@example.com',
            request_message='First message'
        )
        message2 = ContactMessage.objects.create(
            first_name='Second',
            last_name='User',
            email='second@example.com',
            request_message='Second message'
        )
        messages = ContactMessage.objects.all()
        self.assertEqual(messages[0], message2)  # New messages first
        self.assertEqual(messages[1], message1)


class ContactMessageSerializerTest(TestCase):
    """Tests for ContactMessageSerializer"""

    def test_serializer_with_valid_data(self):
        """Test serializer with valid data"""
        data = {
            'first_name': 'John',
            'last_name': 'Doe',
            'email': 'john@example.com',
            'request_message': 'I need help'
        }
        serializer = ContactMessageSerializer(data=data)
        self.assertTrue(serializer.is_valid())
        message = serializer.save()
        self.assertEqual(message.first_name, 'John')

    def test_serializer_read_only_fields(self):
        """Test read_only fields"""
        message = ContactMessage.objects.create(
            first_name='Test',
            last_name='User',
            email='test@example.com',
            request_message='Test'
        )
        serializer = ContactMessageSerializer(message)
        self.assertIn('id', serializer.data)
        self.assertIn('created_at', serializer.data)
        self.assertIn('is_answered', serializer.data)


class ContactMessageViewsTest(APITestCase):
    """Tests for ContactMessage views"""

    def setUp(self):
        self.client = APIClient()
        self.manager_group, _ = Group.objects.get_or_create(name='manager')
        self.manager = User.objects.create_user(
            username='manager',
            email='manager@example.com',
            password='managerpass123'
        )
        self.manager.groups.add(self.manager_group)

    def test_create_contact_message(self):
        """Test contact message creation"""
        url = reverse('notifications:contact-create')
        data = {
            'first_name': 'Test',
            'last_name': 'Client',
            'email': 'client@example.com',
            'request_message': 'I need assistance'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)

    def test_create_contact_message_missing_fields(self):
        """Test message creation with missing fields"""
        url = reverse('notifications:contact-create')
        data = {
            'first_name': 'Test',
            'email': 'test@example.com'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_list_contact_messages_as_manager(self):
        """Test getting message list as manager"""
        ContactMessage.objects.create(
            first_name='Client1',
            last_name='User1',
            email='client1@example.com',
            request_message='Message 1'
        )
        ContactMessage.objects.create(
            first_name='Client2',
            last_name='User2',
            email='client2@example.com',
            request_message='Message 2'
        )
        self.client.force_authenticate(user=self.manager)
        url = reverse('notifications:contact-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_list_contact_messages_unauthenticated(self):
        """Test getting message list without authentication"""
        url = reverse('notifications:contact-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_respond_to_message_as_manager(self):
        """Test responding to message as manager"""
        message = ContactMessage.objects.create(
            first_name='Client',
            last_name='User',
            email='client@example.com',
            request_message='Need help'
        )
        self.client.force_authenticate(user=self.manager)
        url = reverse('notifications:contact-respond', kwargs={'pk': message.pk})
        data = {'response_message': 'We will help you'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        message.refresh_from_db()
        self.assertTrue(message.is_answered)
        self.assertEqual(message.response_message, 'We will help you')

    def test_respond_to_message_without_response(self):
        """Test responding without response text"""
        message = ContactMessage.objects.create(
            first_name='Client',
            last_name='User',
            email='client@example.com',
            request_message='Need help'
        )
        self.client.force_authenticate(user=self.manager)
        url = reverse('notifications:contact-respond', kwargs={'pk': message.pk})
        data = {}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


