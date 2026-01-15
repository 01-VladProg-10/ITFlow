# orderLog/serializers.py
from rest_framework import serializers
from .models import OrderLog
from files.serializers import FileSerializer  # jeśli masz serializer plików


class OrderLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()
    file = FileSerializer(read_only=True)

    class Meta:
        model = OrderLog
        fields = [
            'id',
            'event_type',
            'description',
            'old_value',
            'new_value',
            'timestamp',
            'actor_name',
            'file',
        ]

    def get_actor_name(self, obj):
        if obj.actor:
            return obj.actor.username
        return "System"
