from rest_framework import serializers
from django.contrib.auth.models import Group
from .models import User


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_verify = serializers.CharField(write_only=True, style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password', 'password_verify', 'groups']

    def validate(self, data):
        if data['password'] != data['password_verify']:
            raise serializers.ValidationError({"password": "Hasła muszą być identyczne."})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password_verify')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user