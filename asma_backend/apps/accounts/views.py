from apps.accounts.models import User
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView    
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.serializers import ChangePasswordSerializer, RegisterSerializer, UserSerializer, LoginSerializer, LogoutSerializer, RefreshTokenSerializer, ChangePasswordSerializer, MeSerializer
from django.db import transaction
from django.contrib.auth import login





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


# # update profile view
# def update_profile(request):
#     pass


# # verify email view
# # delete account view
# # list users view (admin only)
# # retrieve user view (admin only)
# # update user view (admin only)
# # delete user view (admin only)
# # password reset view
# # password reset confirm view
# # password reset complete view
# # password reset done view
# # email verification view
# # email verification confirm view
# # email verification complete view
# # email verification done view
# # social login view
# # social login callback view
# # social login complete view
# # social login done view
# # social login disconnect view
# # social login disconnect complete view
# # social login disconnect done view
# # social login disconnect cancel view
# # social login disconnect cancel complete view
# # social login disconnect cancel done view
# # social login disconnect cancel cancel view
# # social login disconnect cancel cancel complete view
# # social login disconnect cancel cancel done view
# # social login disconnect cancel cancel cancel view
# # social login disconnect cancel cancel cancel complete view
# # social login disconnect cancel cancel cancel done view
# # social login disconnect cancel cancel cancel cancel view
# # social login disconnect cancel cancel cancel complete view
# # social login disconnect cancel cancel cancel done view
# # social login disconnect cancel cancel cancel cancel view
# # social login disconnect cancel cancel cancel complete view
# # social login disconnect cancel cancel view
# # social login disconnect cancel complete view
# # social login disconnect cancel done view
# # social login disconnect view      
# # social login disconnect complete view
# # social login disconnect done view
# # social login disconnect cancel view
# # social login disconnect cancel complete view
# # social login disconnect cancel done view