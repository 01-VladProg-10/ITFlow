from rest_framework import serializers
from nortifications.models import ContactMessage

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            'id',
            'first_name',
            'last_name',
            'email',
            'request_message',
            'response_message',
            'is_answered',
            'created_at'
        ]
        read_only_fields = ['id', 'response_message', 'is_answered', 'created_at']
