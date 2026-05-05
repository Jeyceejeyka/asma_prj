import requests
from django.conf import settings
from .token_manager import DarajaTokenManager
from .credentials import DarajaCredentials

class DarajaService:
    def stk_push(self, phone, amount, account_reference, transaction_desc):
        config = settings.DARAJA
        token = DarajaTokenManager.get_token()
        creds = DarajaCredentials.generate()
        url = f"{config['BASE_URL']}/mpesa/stkpush/v1/processrequest"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        payload = {
            "BusinessShortCode": config["SHORTCODE"],
            "Password": creds["password"],
            "Timestamp": creds["timestamp"],
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone,
            "PartyB": config["SHORTCODE"],
            "PhoneNumber": phone,
            "CallBackURL": config["CALLBACK_URL"],
            "AccountReference": account_reference,
            "TransactionDesc": transaction_desc
        }
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        if response.status_code != 200:
            raise Exception(f"Daraja API error: {response.text}")
        data = response.json()
        if data.get("ResponseCode") != "0":
            raise Exception(f"STK push failed: {data}")
        return data
