# orders/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Order
<<<<<<< HEAD

User = get_user_model()
=======
>>>>>>> b9ad27368fbce218340bb92aa3c89be61ac35eeb

User = get_user_model()

class OrderSerializer(serializers.ModelSerializer):
    client_detail = serializers.StringRelatedField(source='client', read_only=True)
    manager_detail = serializers.StringRelatedField(source='manager', read_only=True)
    developer_detail = serializers.StringRelatedField(source='developer', read_only=True)

    manager = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    developer = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Order
        fields = [
            'id', 'title', 'description', 'status',
            'manager', 'developer',
            'client_detail', 'manager_detail', 'developer_detail',
            'created_at', 'updated_at'
        ]
<<<<<<< HEAD
<<<<<<< HEAD
        read_only_fields = ['id', 'created_at', 'updated_at', 'client']

    def create(self, validated_data):
        return Order.objects.create(**validated_data)
=======
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['client'] = request.user
        return super().create(validated_data)
>>>>>>> 2166394907cc6fa51918a94b8d28d1a5a3a3b9ed
=======
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['client'] = request.user
        return super().create(validated_data)
>>>>>>> b9ad27368fbce218340bb92aa3c89be61ac35eeb
