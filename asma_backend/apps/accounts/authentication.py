from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        access_token = None

        if auth_header and auth_header.lower().startswith("bearer "):
            access_token = auth_header.split(" ", 1)[1].strip()

        if not access_token:
            access_token = request.COOKIES.get("access_token")

        if not access_token:
            return None

        validated_token = self.get_validated_token(access_token)
        user = self.get_user(validated_token)

        return (user, validated_token)