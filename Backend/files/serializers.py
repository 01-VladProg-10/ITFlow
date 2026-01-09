from rest_framework import serializers
from .models import File


class FileSerializer(serializers.ModelSerializer):
    # Używamy StringRelatedField, by zamiast ID widzieć np. nazwę użytkownika w polu 'uploaded_by'
    uploaded_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = File
        fields = [
            'id', 'name', 'file_type', 'description',
            'uploaded_by', 'visible_to_clients', 'uploaded_file_url',
            'order', 'created_at', 'updated_at'
        ]
        # Te pola są ustawiane automatycznie przez Django/serwer
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Automatyczne przypisanie użytkownika wg kontekstu requesta
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['uploaded_by'] = request.user

        # 🚨 WAŻNE: Dzięki temu, że pole uploaded_file_url w modelu File jest teraz URLField,
        # ModelSerializer poprawnie je obsłuży i zapisze URL przesłany przez upload_file_api.

        return super().create(validated_data)