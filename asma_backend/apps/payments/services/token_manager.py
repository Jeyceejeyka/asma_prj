import requests
from django.conf import settings
from django.core.cache import cache
from requests.auth import HTTPBasicAuth

class DarajaTokenManager:
    CACHE_KEY = "daraja_access_token"

    @classmethod
    def get_token(cls):
        token_data = cache.get(cls.CACHE_KEY)
        if token_data:
            return token_data["access_token"]
        return cls._refresh_token()

    @classmethod
    def _refresh_token(cls):
        config = settings.DARAJA
        url = f"{config['BASE_URL']}/oauth/v1/generate?grant_type=client_credentials"
        response = requests.get(
            url,
            auth=HTTPBasicAuth(
                config["CONSUMER_KEY"],
                config["CONSUMER_SECRET"]
            ),
            timeout=10
        )
        data = response.json()
        access_token = data.get("access_token")
        expires_in = int(data.get("expires_in", 3600))
        cache.set(
            cls.CACHE_KEY,
            {"access_token": access_token},
            timeout=expires_in - 60
        )
        return access_token
