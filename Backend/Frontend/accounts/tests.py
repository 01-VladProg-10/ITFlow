from django.test import TestCase
from django.contrib.auth.models import Group
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from .models import User
from .serializers import UserSerializer, GroupSerializer


class UserModelTest(TestCase):
    """Tests for User model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )

    def test_user_creation(self):
        """Test user creation"""
        self.assertEqual(self.user.username, 'testuser')
        self.assertEqual(self.user.email, 'test@example.com')
        self.assertTrue(self.user.check_password('testpass123'))

    def test_user_string_representation(self):
        """Test user string representation"""
        self.assertEqual(str(self.user), 'testuser')


class GroupSerializerTest(TestCase):
    """Tests for GroupSerializer"""

    def setUp(self):
        self.group, _ = Group.objects.get_or_create(name='client')

    def test_group_serializer(self):
        """Test group serialization"""
        serializer = GroupSerializer(self.group)
        self.assertEqual(serializer.data['name'], 'client')
        self.assertIn('id', serializer.data)


class UserSerializerTest(TestCase):
    """Tests for UserSerializer"""

    def setUp(self):
        self.user_data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'password_verify': 'newpass123',
            'first_name': 'New',
            'last_name': 'User'
        }

    def test_user_serializer_create(self):
        """Test user creation via serializer"""
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.username, 'newuser')
        self.assertTrue(user.check_password('newpass123'))

    def test_user_serializer_password_mismatch(self):
        """Test error when passwords don't match"""
        data = self.user_data.copy()
        data['password_verify'] = 'differentpass'
        serializer = UserSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('password', serializer.errors)

    def test_user_serializer_update(self):
        """Test user update"""
        user = User.objects.create_user(
            username='olduser',
            email='old@example.com',
            password='oldpass123'
        )
        update_data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'email': 'updated@example.com'
        }
        serializer = UserSerializer(user, data=update_data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_user = serializer.save()
        self.assertEqual(updated_user.first_name, 'Updated')
        self.assertEqual(updated_user.email, 'updated@example.com')

    def test_user_serializer_update_password(self):
        """Test user password update"""
        user = User.objects.create_user(
            username='passuser',
            email='pass@example.com',
            password='oldpass123'
        )
        update_data = {
            'password': 'newpass456',
            'password_verify': 'newpass456'
        }
        serializer = UserSerializer(user, data=update_data, partial=True)
        self.assertTrue(serializer.is_valid())
        updated_user = serializer.save()
        self.assertTrue(updated_user.check_password('newpass456'))


class UserViewSetTest(APITestCase):
    """Tests for UserViewSet"""

    def setUp(self):
        self.client = APIClient()
        self.client_group, _ = Group.objects.get_or_create(name='client')
        self.programmer_group, _ = Group.objects.get_or_create(name='programmer')
        self.manager_group, _ = Group.objects.get_or_create(name='manager')

        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.user.groups.add(self.client_group)

        self.programmer = User.objects.create_user(
            username='programmer1',
            email='prog@example.com',
            password='progpass123'
        )
        self.programmer.groups.add(self.programmer_group)

    def test_register_user(self):
        """Test new user registration"""
        url = reverse('user-register')
        data = {
            'username': 'newclient',
            'email': 'newclient@example.com',
            'password': 'newpass123',
            'password_verify': 'newpass123',
            'first_name': 'New',
            'last_name': 'Client'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'newclient')

    def test_register_user_password_mismatch(self):
        """Test registration with mismatched passwords"""
        url = reverse('user-register')
        data = {
            'username': 'baduser',
            'email': 'bad@example.com',
            'password': 'pass123',
            'password_verify': 'pass456'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_me_endpoint_authenticated(self):
        """Test getting current user data"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')

    def test_me_endpoint_unauthenticated(self):
        """Test access to /me without authentication"""
        url = reverse('user-me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_endpoint_update(self):
        """Test updating current user data"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-me')
        data = {
            'first_name': 'Updated',
            'last_name': 'Name'
        }
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['first_name'], 'Updated')
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')

    def test_dashboard_endpoint(self):
        """Test getting dashboard data"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-dashboard')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('groups', response.data)
        self.assertIn('latest_order', response.data)

    def test_programmers_endpoint(self):
        """Test getting programmers list"""
        self.client.force_authenticate(user=self.user)
        url = reverse('user-programmers')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'programmer1')

    def test_programmers_endpoint_no_group(self):
        """Test getting programmers when group doesn't exist"""
        Group.objects.filter(name='programmer').delete()
        self.client.force_authenticate(user=self.user)
        url = reverse('user-programmers')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

