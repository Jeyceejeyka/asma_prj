from apps.accounts.models import User
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView    
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.serializers import ChangePasswordSerializer, RegisterSerializer, UserSerializer, LoginSerializer, LogoutSerializer, RefreshTokenSerializer, ChangePasswordSerializer, MeSerializer, ForgotPasswordSerializer, ResetPasswordSerializer
from django.db import transaction
from django.contrib.auth import login

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings



# Register views
class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user, context={'request': request}).data,
            "message": "User registered successfully",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # 1. Receive request data
        serializer = LoginSerializer(data=request.data)

        # 2. Validate credentials
        serializer.is_valid(raise_exception=True)

        # 3. Extract authenticated user
        user = serializer.validated_data['user']

        # updates last_login
        login(request, user)

        # 5. Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        # 6. Return response
        return Response({
            "user": UserSerializer(user, context={'request': request}).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_200_OK)

# refresh token view
class RefreshTokenView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RefreshTokenSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        refresh = serializer.validated_data.get("refresh")
        
        try:
            token = RefreshToken(refresh)
            new_access_token = str(token.access_token)

            return Response({
                "access": new_access_token
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)



# logout view
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = LogoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # 1. Get refresh token from request data
        refresh_token = serializer.validated_data.get("refresh")

        if not refresh_token:
            return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # 2. Blacklist the refresh token
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "User logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e: 
            return Response({"error": "Invalid refresh token"}, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        new_password = serializer.validated_data['new_password']

        user.set_password(new_password)
        user.save()

        return Response(
            {"message": "Password changed successfully"},
            status=status.HTTP_200_OK
        )

# profile(me_view)
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = MeSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

# forgot_password view
class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data.get("email")

        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
                        
            # encode user id
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # generate token for the user
            token = default_token_generator.make_token(user)
            
            # initialize reset link plus domain or site eg localhost or domain url
            reset_link = f'settings.Frontend_url_or_domain_name_url/reset-password-confirm/{uid}/{token}'
            # send password reset email to user.email
            send_mail(
                subject="Password Reset Request",
                message=f"Hi {user.username},\n\nYou requested a password reset. Click the link below to reset your password:\n\n{reset_link}\n\nIf you didn't request this, please ignore this email.\n\nThanks,\nYour Team",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
                
            )
            
            return Response({"message": "Password reset email sent"}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User with this email does not exist"}, status=status.HTTP_404_NOT_FOUND)
        
class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        uid = serializer.validated_data.get("uid")
        token = serializer.validated_data.get("token")
        new_password = serializer.validated_data.get("new_password")

        try:
            # decode user_id to get user id
            user_id = force_str(urlsafe_base64_encode(uid))
            user = User.objects.get(pk=user_id)
        except(TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": "Invalid uid"}, status=status.HTTP_400_BAD_REQUEST)
        
        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password) 
        user.save()

        return Response({"message": "Password reset successful"}, status=status.HTTP_200_OK)

# ===============Admin views ============
# UserListView
# UserDetailView
# UserUpdateView
# UserDeleteView