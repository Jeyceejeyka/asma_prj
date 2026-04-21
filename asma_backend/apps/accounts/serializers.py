from apps.accounts.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "is_staff"
        ]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "password2"]

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({
                "password": "Passwords do not match"
            })
        return attrs

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data.pop("password2")

        user = User(
            username=validated_data["username"],
            email=validated_data["email"].lower(),
        )

        user.set_password(password)
        user.save()

        return user
    
    
class LoginSerializer(serializers.Serializer): # pylint: disable=abstract-method
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    
    def validate(self, attrs):
        email = attrs.get('email').lower()
        password = attrs.get('password')

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password")

        attrs['user'] = user
        return attrs
    
class LogoutSerializer(serializers.Serializer):  # pylint: disable=abstract-method
    refresh = serializers.CharField(write_only=True, required=True)


class RefreshTokenSerializer(serializers.Serializer):  # pylint: disable=abstract-method
    refresh = serializers.CharField(write_only=True, required=True)
    
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    
    def validate_new_password(self, value):
        validate_password(value)
        return value
    
    def validate(self, attrs):
        user = self.context['request'].user

        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError(
                "New password cannot be the same as the old password"
            )

        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError(
                "Old password is incorrect"
            )

        return attrs
    
class MeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
        ]
        read_only_fields = ["id", "email", "username"]

    def validate_first_name(self, value):
        if not value:
            raise serializers.ValidationError("First name cannot be empty")
        return value



class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    