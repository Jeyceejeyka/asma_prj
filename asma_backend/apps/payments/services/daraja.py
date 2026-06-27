import requests
from django.conf import settings
from .token_manager import DarajaTokenManager
from .credentials import DarajaCredentials

class DarajaService:
    def stk_push(self, phone, amount, account_reference, transaction_desc):
        try:
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
            print("apps/payments/services/daraja.py: DarajaService.stk_push request payload=", payload)
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            print("apps/payments/services/daraja.py: DarajaService.stk_push response status=", response.status_code)
            print("apps/payments/services/daraja.py: DarajaService.stk_push response headers=", dict(response.headers))
            response_text = response.text
            print("apps/payments/services/daraja.py: DarajaService.stk_push response text length=", len(response_text))
            print("apps/payments/services/daraja.py: DarajaService.stk_push response text=", response_text[:2000] if response_text else "<empty>")

            if response.status_code != 200:
                raise Exception(
                    f"Daraja API error ({response.status_code}): {response_text or '<empty response>'}"
                )

            if not response_text or response_text.isspace():
                raise Exception(
                    f"Daraja API returned empty response body"
                )

            try:
                data = response.json()
            except ValueError as exc:
                raise Exception(
                    f"Daraja API response JSON parse error: {exc}; raw_response={response_text!r}"
                )

            if data.get("ResponseCode") != "0":
                raise Exception(f"STK push failed: {data}")
            print("apps/payments/services/daraja.py: DarajaService.stk_push SUCCESS response=", data)
            return data
        except Exception as e:
            print("apps/payments/services/daraja.py: DarajaService.stk_push EXCEPTION=", str(e))
            raise
