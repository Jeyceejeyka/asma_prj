from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import (
    urlsafe_base64_encode,
    urlsafe_base64_decode,
)
from urllib.parse import quote

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.models import User
from apps.accounts.serializers import (
    RegisterSerializer,
    UserSerializer,
    LoginSerializer,
    MeSerializer,
    ChangePasswordSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)

from .utils import set_auth_cookies, clear_auth_cookies


def _get_refresh_token(request):
    return (
        request.data.get("refresh_token")
        or request.headers.get("X-Refresh-Token")
        or request.COOKIES.get("refresh_token")
    )


# =========================
# AUTH VIEWS
# =========================

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        # Update last_login
        login(request, user)

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response(
            {
                "message": "Registration successful",
                "user": UserSerializer(
                    user,
                    context={"request": request},
                ).data,
                "access_token": access_token,
                "refresh_token": refresh_token,
            },
            status=status.HTTP_201_CREATED,
        )

        secure_cookie = request.is_secure() or request.get_host().split(':')[0] in ("localhost", "127.0.0.1")

        # Set secure cookies
        set_auth_cookies(
            response,
            access_token,
            refresh_token,
            secure=secure_cookie,
        )

        return response


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        # Updates last_login
        login(request, user)

        refresh = RefreshToken.for_user(user)

        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = Response(
            {
                "message": "Login successful",
                "user": UserSerializer(
                    user,
                    context={"request": request},
                ).data,
                "access_token": access_token,
                "refresh_token": refresh_token,
            },
            status=status.HTTP_200_OK,
        )

        secure_cookie = request.is_secure() or request.get_host().split(':')[0] in ("localhost", "127.0.0.1")

        # Set secure cookies
        set_auth_cookies(
            response,
            access_token,
            refresh_token,
            secure=secure_cookie,
        )

        return response


class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        refresh_token = _get_refresh_token(request)

        if not refresh_token:
            return Response(
                {"detail": "No refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh = RefreshToken(refresh_token)

            # Generate new access token
            access_token = str(refresh.access_token)

            response = Response(
                {
                    "message": "Token refreshed",
                    "access_token": access_token,
                    "refresh_token": str(refresh),
                },
                status=status.HTTP_200_OK,
            )

            secure_cookie = request.is_secure() or request.get_host().split(':')[0] in ("localhost", "127.0.0.1")

            # Update access token cookie
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=secure_cookie,
                samesite="None",
                max_age=60 * 10,
            )

            return response

        except Exception:
            return Response(
                {"detail": "Invalid refresh token"},
                status=status.HTTP_401_UNAUTHORIZED,
            )


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        refresh_token = _get_refresh_token(request)
        secure_cookie = request.is_secure() or request.get_host().split(':')[0] in ("localhost", "127.0.0.1")

        response = Response(
            {"message": "User logged out successfully"},
            status=status.HTTP_205_RESET_CONTENT,
        )

        # Clear cookies even if token invalid
        clear_auth_cookies(response)

        if not refresh_token:
            return response

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass

        return response


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    # Get authenticated user
    def get(self, request):
        serializer = MeSerializer(
            request.user,
            context={"request": request},
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )

    # Update authenticated user
    def patch(self, request):
        serializer = MeSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            serializer.data,
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)

        user = request.user
        new_password = serializer.validated_data["new_password"]

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password changed successfully"},
            status=status.HTTP_200_OK,
        )


# =========================
# PASSWORD RESET
# =========================

class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)

            token = default_token_generator.make_token(user)

            reset_link = (
                f"{settings.FRONTEND_URL}"
                f"/reset-password?email={quote(email)}&token={quote(token)}"
            )

            send_mail(
                subject="Password Reset Request",
                message=(
                    f"Hi {user.username},\n\n"
                    f"Use the link below to reset your password:\n\n"
                    f"{reset_link}\n\n"
                    f"If you did not request this, ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response(
                {"message": "Password reset email sent successfully"},
                status=status.HTTP_200_OK,
            )

        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist"},
                status=status.HTTP_404_NOT_FOUND,
            )


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        token = serializer.validated_data["token"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User with this email does not exist"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"error": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password reset successful"},
            status=status.HTTP_200_OK,
        )


# =========================
# ADMIN USER MANAGEMENT
# =========================

class UserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()


class UserDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()


class UserUpdateView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()


class UserDeleteView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer
    queryset = User.objects.all()