from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from .models import OrderLog
from .serializers import OrderLogSerializer
from orders.models import Order
from files.models import File

User = get_user_model()


class OrderLogModelTest(TestCase):
    """Tests for OrderLog model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.order = Order.objects.create(
            title='Test Order',
            description='Test Description',
            client=self.user
        )

    def test_order_log_creation(self):
        """Test log entry creation"""
        log = OrderLog.objects.create(
            order=self.order,
            actor=self.user,
            event_type='status_change',
            description='Status changed to in_progress'
        )
        self.assertEqual(log.order, self.order)
        self.assertEqual(log.actor, self.user)
        self.assertEqual(log.event_type, 'status_change')

    def test_order_log_string_representation(self):
        """Test entry string representation"""
        log = OrderLog.objects.create(
            order=self.order,
            actor=self.user,
            event_type='comment',
            description='Added a comment'
        )
        self.assertIn('Test Order', str(log))

    def test_order_log_default_event_type(self):
        """Test default value for event_type"""
        log = OrderLog.objects.create(
            order=self.order,
            actor=self.user,
            description='Test log'
        )
        self.assertEqual(log.event_type, 'comment')

    def test_order_log_with_file(self):
        """Test entry with attached file"""
        file = File.objects.create(
            name='test.pdf',
            uploaded_by=self.user,
            order=self.order
        )
        log = OrderLog.objects.create(
            order=self.order,
            actor=self.user,
            event_type='file_added',
            description='Added file',
            file=file
        )
        self.assertEqual(log.file, file)

    def test_order_log_with_old_new_values(self):
        """Test entry with old and new values"""
        log = OrderLog.objects.create(
            order=self.order,
            actor=self.user,
            event_type='status_change',
            description='Status changed',
            old_value='submitted',
            new_value='in_progress'
        )
        self.assertEqual(log.old_value, 'submitted')
        self.assertEqual(log.new_value, 'in_progress')

    def test_order_log_ordering(self):
        """Test log entries ordering"""
        log1 = OrderLog.objects.create(
            order=self.order,
            actor=self.user,
            event_type='comment',
            description='First log'
        )
        log2 = OrderLog.objects.create(
            order=self.order,
            actor=self.user,
            event_type='comment',
            description='Second log'
        )
        logs = OrderLog.objects.all()
        self.assertEqual(logs[0], log1)  # Old entries first
        self.assertEqual(logs[1], log2)


class OrderLogSerializerTest(TestCase):
    """Tests for OrderLogSerializer"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.order = Order.objects.create(
            title='Test Order',
            description='Test Description',
            client=self.user
        )

    def test_order_log_serializer_read(self):
        """Test entry reading via serializer"""
        log = OrderLog.objects.create(
            order=self.order,
            actor=self.user,
            event_type='status_change',
            description='Status changed'
        )
        serializer = OrderLogSerializer(log)
        self.assertEqual(serializer.data['description'], 'Status changed')
        self.assertEqual(serializer.data['event_type'], 'status_change')
        self.assertEqual(serializer.data['actor_name'], 'testuser')

    def test_order_log_serializer_actor_name_system(self):
        """Test getting actor name as 'System' if actor is None"""
        log = OrderLog.objects.create(
            order=self.order,
            actor=None,
            event_type='other',
            description='System action'
        )
        serializer = OrderLogSerializer(log)
        self.assertEqual(serializer.data['actor_name'], 'System')

    def test_order_log_serializer_with_file(self):
        """Test entry serialization with file"""
        file = File.objects.create(
            name='test.pdf',
            uploaded_by=self.user,
            order=self.order
        )
        log = OrderLog.objects.create(
            order=self.order,
            actor=self.user,
            event_type='file_added',
            description='File added',
            file=file
        )
        serializer = OrderLogSerializer(log)
        self.assertIn('file', serializer.data)
        self.assertIsNotNone(serializer.data['file'])


class OrderLogViewSetTest(APITestCase):
    """Tests for OrderLogViewSet"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.order = Order.objects.create(
            title='Test Order',
            description='Test Description',
            client=self.user
        )
        OrderLog.objects.create(
            order=self.order,
            actor=self.user,
            event_type='status_change',
            description='First log'
        )
        OrderLog.objects.create(
            order=self.order,
            actor=self.user,
            event_type='comment',
            description='Second log'
        )

    def test_order_history_authenticated(self):
        """Test getting order history with authentication"""
        self.client.force_authenticate(user=self.user)
        url = reverse('order-log-order-history', kwargs={'order_id': self.order.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_order_history_unauthenticated(self):
        """Test getting history without authentication"""
        url = reverse('order-log-order-history', kwargs={'order_id': self.order.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_order_history_ordering(self):
        """Test order history sorting"""
        self.client.force_authenticate(user=self.user)
        url = reverse('order-log-order-history', kwargs={'order_id': self.order.id})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that entries are sorted by time
        self.assertEqual(response.data[0]['description'], 'First log')
        self.assertEqual(response.data[1]['description'], 'Second log')


