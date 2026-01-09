# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth.models import Group
from .models import User


class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']


class UserSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    password = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=False)
    password_verify = serializers.CharField(write_only=True, style={'input_type': 'password'}, required=False)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'password',
            'password_verify',
            'groups'
        ]
        read_only_fields = ['id', 'groups']

    def update(self, instance, validated_data):
        # ignorujemy pole company, jeśli jest w payloadzie
        validated_data.pop('company', None)

        password = validated_data.pop('password', None)
        validated_data.pop('password_verify', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance

    def validate(self, data):
        password = data.get('password')
        password_verify = data.get('password_verify')
        if password or password_verify:
            if password != password_verify:
                raise serializers.ValidationError({"password": "Hasła muszą być identyczne."})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        validated_data.pop('password_verify', None)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=password,
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user