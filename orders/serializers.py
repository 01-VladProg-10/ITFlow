from rest_framework import serializers
from .models import Order
from accounts.serializers import UserSerializer

class OrderSerializer(serializers.ModelSerializer):
    client = UserSerializer(read_only=True)
    manager = UserSerializer(read_only=True)
    developer = UserSerializer(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'title',
            'description',
            'status',
            'client',
            'manager',
            'developer',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'client']

    def create(self, validated_data):
        return Order.objects.create(**validated_data)
