from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from .models import File
from .serializers import FileSerializer
from orders.models import Order

User = get_user_model()


class FileModelTest(TestCase):
    """Tests for File model"""

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

    def test_file_creation(self):
        """Test file creation"""
        file = File.objects.create(
            name='test.pdf',
            file_type='pdf',
            description='Test file',
            order=self.order,
            uploaded_by=self.user,
            uploaded_file_url='https://example.com/test.pdf'
        )
        self.assertEqual(file.name, 'test.pdf')
        self.assertEqual(file.file_type, 'pdf')
        self.assertEqual(file.order, self.order)
        self.assertEqual(file.uploaded_by, self.user)

    def test_file_string_representation(self):
        """Test file string representation"""
        file = File.objects.create(
            name='document.docx',
            file_type='docx',
            uploaded_by=self.user
        )
        self.assertEqual(str(file), 'document.docx')

    def test_file_default_values(self):
        """Test default values"""
        file = File.objects.create(
            name='test_file.zip',
            uploaded_by=self.user
        )
        self.assertEqual(file.file_type, 'other')
        self.assertFalse(file.visible_to_clients)

    def test_file_ordering(self):
        """Test file ordering"""
        file1 = File.objects.create(name='file1.pdf', uploaded_by=self.user)
        file2 = File.objects.create(name='file2.pdf', uploaded_by=self.user)
        files = File.objects.all()
        self.assertEqual(files[0], file2)  # New files come first
        self.assertEqual(files[1], file1)

    def test_file_visible_to_clients(self):
        """Test file visibility to clients"""
        file = File.objects.create(
            name='visible.pdf',
            uploaded_by=self.user,
            visible_to_clients=True
        )
        self.assertTrue(file.visible_to_clients)

    def test_file_with_null_order(self):
        """Test file without order attachment"""
        file = File.objects.create(
            name='orphan.pdf',
            uploaded_by=self.user,
            order=None
        )
        self.assertIsNone(file.order)

    def test_file_uploaded_by_cascade(self):
        """Test cascade deletion when user is deleted"""
        file = File.objects.create(
            name='test.pdf',
            uploaded_by=self.user
        )
        user_id = self.user.id
        self.user.delete()
        file.refresh_from_db()
        self.assertIsNone(file.uploaded_by)  # SET_NULL


class FileSerializerTest(TestCase):
    """Tests for FileSerializer"""

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

    def test_file_serializer_read(self):
        """Test file reading via serializer"""
        file = File.objects.create(
            name='test.pdf',
            file_type='pdf',
            uploaded_by=self.user,
            uploaded_file_url='https://example.com/test.pdf'
        )
        serializer = FileSerializer(file)
        self.assertEqual(serializer.data['name'], 'test.pdf')
        self.assertEqual(serializer.data['file_type'], 'pdf')
        self.assertEqual(serializer.data['uploaded_by'], 'testuser')

    def test_file_serializer_create_with_context(self):
        """Test file creation via serializer with context"""
        from unittest.mock import Mock
        request = Mock()
        request.user = self.user

        data = {
            'name': 'new_file.docx',
            'file_type': 'docx',
            'uploaded_file_url': 'https://example.com/new.docx',
            'order': self.order.id
        }
        serializer = FileSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid())
        file = serializer.save()
        self.assertEqual(file.uploaded_by, self.user)

    def test_file_serializer_read_only_fields(self):
        """Test read_only fields"""
        file = File.objects.create(
            name='test.pdf',
            uploaded_by=self.user
        )
        serializer = FileSerializer(file)
        self.assertIn('created_at', serializer.data)
        self.assertIn('updated_at', serializer.data)


