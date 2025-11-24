from rest_framework import serializers
from nortifications.models import ContactMessage
import re


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ['id', 'name', 'email', 'subject', 'message', 'created_at']
        read_only_fields = ['id', 'created_at']
    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Imię musi mieć co najmniej 2 znaki.")
        return value

    def validate_email(self, value):
        value = value.strip()
        if not re.match(r"[^@]+@[^@]+\.[^@]+", value):
            raise serializers.ValidationError("Nieprawidłowy adres e-mail.")
        return value

    def validate_subject(self, value):
        value = value.strip()
        if len(value) < 5:
            raise serializers.ValidationError("Temat musi mieć co najmniej 5 znaków.")
        return value

    def validate_message(self, value):
        value = value.strip()
        if len(value) < 10:
            raise serializers.ValidationError("Wiadomość musi mieć co najmniej 10 znaków.")
        if len(value) > 5000:
            raise serializers.ValidationError("Wiadomość jest za długa.")
        return value   
