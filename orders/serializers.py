# orders/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Order

User = get_user_model()


class OrderSerializer(serializers.ModelSerializer):
    # отображение имени клиента/менеджера/девелопера
    client_detail = serializers.StringRelatedField(source='client', read_only=True)
    manager_detail = serializers.StringRelatedField(source='manager', read_only=True)
    developer_detail = serializers.StringRelatedField(source='developer', read_only=True)

    # поля, которые можно выбирать из списка (id)
    manager = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)
    developer = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False)

    class Meta:
        model = Order
        fields = [
            'id',
            'title',
            'description',
            'status',
            'manager',
            'developer',
            'client_detail',
            'manager_detail',
            'developer_detail',
            'created_at',
            'updated_at',
        ]

        read_only_fields = ['id', 'created_at', 'updated_at', 'client']

    # -------------------------------
    # Validators
    # -------------------------------
    def validate_title(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Tytuł musi mieć co najmniej 3 znaki.")
        if len(value) > 100:
            raise serializers.ValidationError("Tytuł nie może przekraczać 100 znaków.")
        return value

    def validate_description(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Opis musi mieć co najmniej 10 znaków.")
        return value

    def validate_status(self, value):
        allowed = [choice[0] for choice in Order.STATUS_CHOICES]
        if value not in allowed:
            raise serializers.ValidationError("Nieprawidłowy status zamówienia.")
        return value

    def validate(self, attrs):
        status = attrs.get('status') or getattr(self.instance, 'status', None)
        developer = attrs.get('developer') or getattr(self.instance, 'developer', None)

        # если задача завершена — обязан быть developer
        if status == "done" and developer is None:
            raise serializers.ValidationError({
                "developer": "Zamówienie zakończone musi mieć przypisanego developera."
            })

        return attrs

    # -------------------------------
    # Create: автоматически ставим client
    # -------------------------------
    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['client'] = request.user

        return Order.objects.create(**validated_data)
