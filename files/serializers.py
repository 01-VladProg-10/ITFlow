from rest_framework import serializers
from .models import File

class FileSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.StringRelatedField(read_only=True)
    uploaded_file_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = [
            'id',
            'name',
            'file_type',
            'description',
            'uploaded_by',
            'visible_to_clients',
            'uploaded_file_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['uploaded_by', 'created_at', 'updated_at']

    def get_uploaded_file_url(self, obj):
        if obj.uploaded_file:
            return obj.uploaded_file.url  # teraz URL zawsze do R2
        return None
