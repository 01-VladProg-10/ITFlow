from django.test import TestCase
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from .models import Order
from .serializers import OrderSerializer
from orderLog.models import OrderLog

User = get_user_model()


class OrderModelTest(TestCase):
    """Tests for Order model"""

    def setUp(self):
        self.client_user = User.objects.create_user(
            username='client',
            email='client@example.com',
            password='clientpass123'
        )
        self.manager_user = User.objects.create_user(
            username='manager',
            email='manager@example.com',
            password='managerpass123'
        )
        self.developer_user = User.objects.create_user(
            username='developer',
            email='dev@example.com',
            password='devpass123'
        )

    def test_order_creation(self):
        """Test order creation"""
        order = Order.objects.create(
            title='Test Order',
            description='Test Description',
            client=self.client_user
        )
        self.assertEqual(order.title, 'Test Order')
        self.assertEqual(order.client, self.client_user)
        self.assertEqual(order.status, 'submitted')

    def test_order_string_representation(self):
        """Test order string representation"""
        order = Order.objects.create(
            title='My Order',
            description='Description',
            client=self.client_user,
            status='in_progress'
        )
        self.assertIn('My Order', str(order))

    def test_order_default_status(self):
        """Test default status"""
        order = Order.objects.create(
            title='Order',
            description='Desc',
            client=self.client_user
        )
        self.assertEqual(order.status, 'submitted')

    def test_order_with_manager_and_developer(self):
        """Test order with manager and developer"""
        order = Order.objects.create(
            title='Full Order',
            description='Description',
            client=self.client_user,
            manager=self.manager_user,
            developer=self.developer_user
        )
        self.assertEqual(order.manager, self.manager_user)
        self.assertEqual(order.developer, self.developer_user)

    def test_update_status_and_log(self):
        """Test status update with logging"""
        order = Order.objects.create(
            title='Order',
            description='Desc',
            client=self.client_user,
            status='submitted'
        )
        order.update_status_and_log('accepted', self.manager_user)
        self.assertEqual(order.status, 'accepted')
        
        # Check that a log entry was created
        log = OrderLog.objects.filter(order=order, event_type='status_change').first()
        self.assertIsNotNone(log)
        self.assertEqual(log.old_value, 'submitted')
        self.assertEqual(log.new_value, 'accepted')

    def test_log_event(self):
        """Test log_event method"""
        order = Order.objects.create(
            title='Order',
            description='Desc',
            client=self.client_user
        )
        order.log_event(
            user=self.manager_user,
            event_type='comment',
            description='Test comment'
        )
        log = OrderLog.objects.filter(order=order).first()
        self.assertIsNotNone(log)
        self.assertEqual(log.description, 'Test comment')


class OrderSerializerTest(TestCase):
    """Tests for OrderSerializer"""

    def setUp(self):
        self.client_user = User.objects.create_user(
            username='client',
            email='client@example.com',
            password='clientpass123'
        )

    def test_order_serializer_read(self):
        """Test order reading via serializer"""
        order = Order.objects.create(
            title='Test Order',
            description='Test Description',
            client=self.client_user
        )
        serializer = OrderSerializer(order)
        self.assertEqual(serializer.data['title'], 'Test Order')
        self.assertEqual(serializer.data['status'], 'submitted')

    def test_order_serializer_create_with_context(self):
        """Test order creation via serializer with context"""
        from unittest.mock import Mock
        request = Mock()
        request.user = self.client_user

        data = {
            'title': 'New Order',
            'description': 'New Description'
        }
        serializer = OrderSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid())
        order = serializer.save()
        self.assertEqual(order.client, self.client_user)


class OrderViewSetTest(APITestCase):
    """Tests for OrderViewSet"""

    def setUp(self):
        self.client = APIClient()
        
        # Get or create groups
        self.client_group, _ = Group.objects.get_or_create(name='client')
        self.manager_group, _ = Group.objects.get_or_create(name='manager')
        self.programmer_group, _ = Group.objects.get_or_create(name='programmer')
        
        # Create users
        self.client_user = User.objects.create_user(
            username='client',
            email='client@example.com',
            password='clientpass123'
        )
        self.client_user.groups.add(self.client_group)
        
        self.manager_user = User.objects.create_user(
            username='manager',
            email='manager@example.com',
            password='managerpass123'
        )
        self.manager_user.groups.add(self.manager_group)
        
        self.developer_user = User.objects.create_user(
            username='developer',
            email='dev@example.com',
            password='devpass123'
        )
        self.developer_user.groups.add(self.programmer_group)

    def test_create_order_authenticated(self):
        """Test order creation with authentication"""
        self.client.force_authenticate(user=self.client_user)
        url = reverse('order-create-order')
        data = {
            'title': 'New Order',
            'description': 'Order Description'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Order')

    def test_create_order_unauthenticated(self):
        """Test order creation without authentication"""
        url = reverse('order-create-order')
        data = {
            'title': 'New Order',
            'description': 'Description'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_queryset_as_client(self):
        """Test getting order list as client"""
        order1 = Order.objects.create(
            title='Client Order',
            description='Desc',
            client=self.client_user
        )
        other_user = User.objects.create_user(
            username='other',
            email='other@example.com',
            password='pass'
        )
        order2 = Order.objects.create(
            title='Other Order',
            description='Desc',
            client=other_user
        )
        
        self.client.force_authenticate(user=self.client_user)
        url = reverse('order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Client sees only their own orders
        self.assertEqual(len(response.data), 1)

    def test_get_queryset_as_manager(self):
        """Test getting all orders as manager"""
        Order.objects.create(
            title='Order 1',
            description='Desc',
            client=self.client_user
        )
        other_user = User.objects.create_user(
            username='other',
            email='other@example.com',
            password='pass'
        )
        Order.objects.create(
            title='Order 2',
            description='Desc',
            client=other_user
        )
        
        self.client.force_authenticate(user=self.manager_user)
        url = reverse('order-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Manager sees all orders
        self.assertEqual(len(response.data), 2)

    def test_assign_developer_as_manager(self):
        """Test developer assignment as manager"""
        order = Order.objects.create(
            title='Order',
            description='Desc',
            client=self.client_user
        )
        
        self.client.force_authenticate(user=self.manager_user)
        url = reverse('order-assign', kwargs={'pk': order.pk})
        data = {'developer': self.developer_user.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        order.refresh_from_db()
        self.assertEqual(order.developer, self.developer_user)
        self.assertEqual(order.manager, self.manager_user)

    def test_assign_developer_as_non_manager(self):
        """Test developer assignment as non-manager"""
        order = Order.objects.create(
            title='Order',
            description='Desc',
            client=self.client_user
        )
        
        self.client.force_authenticate(user=self.client_user)
        url = reverse('order-assign', kwargs={'pk': order.pk})
        data = {'developer': self.developer_user.id}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_change_status_manager(self):
        """Test status change by manager"""
        order = Order.objects.create(
            title='Order',
            description='Desc',
            client=self.client_user,
            status='submitted'
        )
        
        self.client.force_authenticate(user=self.manager_user)
        url = reverse('order-change-status', kwargs={'pk': order.pk})
        data = {'status': 'accepted'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        order.refresh_from_db()
        self.assertEqual(order.status, 'accepted')

    def test_change_status_programmer(self):
        """Test status change by programmer"""
        order = Order.objects.create(
            title='Order',
            description='Desc',
            client=self.client_user,
            status='accepted',
            developer=self.developer_user
        )
        
        self.client.force_authenticate(user=self.developer_user)
        url = reverse('order-change-status', kwargs={'pk': order.pk})
        data = {'status': 'in_progress'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        order.refresh_from_db()
        self.assertEqual(order.status, 'in_progress')

    def test_change_status_invalid_transition(self):
        """Test invalid status change"""
        order = Order.objects.create(
            title='Order',
            description='Desc',
            client=self.client_user,
            status='submitted'
        )
        
        self.client.force_authenticate(user=self.manager_user)
        url = reverse('order-change-status', kwargs={'pk': order.pk})
        data = {'status': 'done'}  # Invalid transition
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_change_status_client(self):
        """Test status change by client"""
        order = Order.objects.create(
            title='Order',
            description='Desc',
            client=self.client_user,
            status='awaiting_review'
        )
        
        self.client.force_authenticate(user=self.client_user)
        url = reverse('order-change-status', kwargs={'pk': order.pk})
        data = {'status': 'done'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        order.refresh_from_db()
        self.assertEqual(order.status, 'done')





