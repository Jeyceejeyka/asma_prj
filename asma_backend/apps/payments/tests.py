from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from apps.orders.models import Order
from apps.payments.models import PaymentTransaction


class DarajaPaymentValidationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email="buyer@example.com",
            username="buyer",
            password="StrongPass123!",
        )
        self.order = Order.objects.create(
            user=self.user,
            total_price=Decimal("2500.00"),
            status="pending",
        )
        self.payment = PaymentTransaction.objects.create(
            user=self.user,
            order=self.order,
            checkout_request_id="ws_CO_123456789",
            merchant_request_id="ws_MR_123456789",
            phone_number="254712345678",
            amount=Decimal("2500.00"),
            status=PaymentTransaction.PENDING,
        )

    def test_success_callback_validates_amount_and_receipt(self):
        payload = {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": self.payment.merchant_request_id,
                    "CheckoutRequestID": self.payment.checkout_request_id,
                    "ResultCode": 0,
                    "ResultDesc": "The service request is processed successfully.",
                    "CallbackMetadata": {
                        "Item": [
                            {"Name": "Amount", "Value": 2500.0},
                            {"Name": "MpesaReceiptNumber", "Value": "KTR123456"},
                            {"Name": "PhoneNumber", "Value": 254712345678},
                        ]
                    },
                }
            }
        }

        response = self.client.post("/api/v1/payments/daraja/callback/", payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentTransaction.SUCCESS)
        self.assertEqual(self.payment.mpesa_receipt_number, "KTR123456")
        self.assertTrue(self.payment.processed)

    def test_mismatched_amount_is_rejected(self):
        payload = {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": self.payment.merchant_request_id,
                    "CheckoutRequestID": self.payment.checkout_request_id,
                    "ResultCode": 0,
                    "ResultDesc": "The service request is processed successfully.",
                    "CallbackMetadata": {
                        "Item": [
                            {"Name": "Amount", "Value": 3000.0},
                            {"Name": "MpesaReceiptNumber", "Value": "KTR654321"},
                            {"Name": "PhoneNumber", "Value": 254712345678},
                        ]
                    },
                }
            }
        }

        response = self.client.post("/api/v1/payments/daraja/callback/", payload, format="json")

        self.assertEqual(response.status_code, 400)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentTransaction.PENDING)

    def test_duplicate_callback_is_idempotent(self):
        payload = {
            "Body": {
                "stkCallback": {
                    "MerchantRequestID": self.payment.merchant_request_id,
                    "CheckoutRequestID": self.payment.checkout_request_id,
                    "ResultCode": 0,
                    "ResultDesc": "The service request is processed successfully.",
                    "CallbackMetadata": {
                        "Item": [
                            {"Name": "Amount", "Value": 2500.0},
                            {"Name": "MpesaReceiptNumber", "Value": "KTR123456"},
                            {"Name": "PhoneNumber", "Value": 254712345678},
                        ]
                    },
                }
            }
        }

        first = self.client.post("/api/v1/payments/daraja/callback/", payload, format="json")
        second = self.client.post("/api/v1/payments/daraja/callback/", payload, format="json")

        self.assertEqual(first.status_code, 200)
        self.assertEqual(second.status_code, 200)
        self.payment.refresh_from_db()
        self.assertEqual(self.payment.status, PaymentTransaction.SUCCESS)
        self.assertEqual(self.payment.mpesa_receipt_number, "KTR123456")
