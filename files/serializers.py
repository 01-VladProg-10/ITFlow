from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = File
        fields = [
            'id', 'name', 'file_type', 'description',
            'uploaded_by', 'visible_to_clients', 'uploaded_file_url',
            'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']  # NIE read_only dla uploaded_file_url

    def create(self, validated_data):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['uploaded_by'] = request.user
        return super().create(validated_data)
