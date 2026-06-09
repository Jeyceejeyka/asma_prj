from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers

from apps.accounts.models import User


# =========================
# USER SERIALIZER
# =========================

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "is_staff",
            "role",
        ]
        read_only_fields = [
            "id",
            "is_staff",
            "role",
        ]

    def get_role(self, obj):
        return "admin" if obj.is_staff or obj.is_superuser else "user"


# =========================
# REGISTER
# =========================

class RegisterSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    last_name = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
    )

    password2 = serializers.CharField(
        write_only=True,
        required=True,
    )

    class Meta:
        model = User
        fields = [
            "username",
            "email",
            "first_name",
            "last_name",
            "password",
            "password2",
        ]

    def validate_email(self, value):
        value = value.lower().strip()

        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "A user with this email already exists."
            )

        return value

    def validate_username(self, value):
        value = value.strip()

        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({
                "password": "Passwords do not match."
            })

        return attrs

    def create(self, validated_data):
        validated_data.pop("password2")

        password = validated_data.pop("password")

        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"].lower(),
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )

        user.set_password(password)
        user.save()

        return user


# =========================
# LOGIN
# =========================

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    password = serializers.CharField(
        write_only=True,
        required=True,
    )

    def validate(self, attrs):
        email = attrs.get("email").lower().strip()
        password = attrs.get("password")

        user = authenticate(
            username=email,
            password=password,
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "User account is disabled."
            )

        attrs["user"] = user

        return attrs


# =========================
# CHANGE PASSWORD
# =========================

class ChangePasswordSerializer(serializers.Serializer):

    old_password = serializers.CharField(
        write_only=True,
        required=True,
    )

    new_password = serializers.CharField(
        write_only=True,
        required=True,
    )

    def validate_new_password(self, value):
        validate_password(value)
        return value

    def validate(self, attrs):
        user = self.context["request"].user

        if attrs["old_password"] == attrs["new_password"]:
            raise serializers.ValidationError(
                "New password cannot be the same as the old password."
            )

        if not user.check_password(attrs["old_password"]):
            raise serializers.ValidationError(
                "Old password is incorrect."
            )

        return attrs


# =========================
# PROFILE / ME
# =========================

class MeSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "role",
        ]

        read_only_fields = [
            "id",
            "email",
            "username",
            "role",
        ]

    def get_role(self, obj):
        return "admin" if obj.is_staff or obj.is_superuser else "user"

    def validate_first_name(self, value):
        if value is not None:
            value = value.strip()

        return value

    def validate_last_name(self, value):
        if value is not None:
            value = value.strip()

        return value


# =========================
# FORGOT PASSWORD
# =========================

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        value = value.lower().strip()

        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "User with this email does not exist."
            )

        return value


# =========================
# RESET PASSWORD
# =========================

class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True, required=True)

    token = serializers.CharField(
        write_only=True,
        required=True,
    )

    new_password = serializers.CharField(
        write_only=True,
        required=True,
    )

    def validate_email(self, value):
        value = value.lower().strip()

        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "User with this email does not exist."
            )

        return value

    def validate_new_password(self, value):
        validate_password(value)
        return value