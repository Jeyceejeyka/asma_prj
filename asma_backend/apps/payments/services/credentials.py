import base64
from datetime import datetime
from django.conf import settings

class DarajaCredentials:
    @staticmethod
    def generate():
        config = settings.DARAJA
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        raw = f"{config['SHORTCODE']}{config['PASSKEY']}{timestamp}"
        password = base64.b64encode(raw.encode()).decode()
        return {
            "timestamp": timestamp,
            "password": password
        }
