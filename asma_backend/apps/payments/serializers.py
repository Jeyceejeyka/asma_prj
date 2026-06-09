# from rest_framework import serializers
# from .models import PaymentTransaction

# class PaymentTransactionSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = PaymentTransaction
#         fields = [
#             "id",
#             "user",
#             "order",
#             "checkout_request_id",
#             "merchant_request_id",
#             "phone_number",
#             "amount",
#             "mpesa_receipt_number",
#             "status",
#             "processed",
#             "result_code",
#             "result_desc",
#             "created_at",
#             "updated_at",
#         ]
#         read_only_fields = ['id', 'created_at']


from rest_framework import serializers
from .models import PaymentTransaction


class PaymentTransactionSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)
    order_id = serializers.IntegerField(source="order.id", read_only=True)

    class Meta:
        model = PaymentTransaction
        fields = [
            # Core
            "id",

            # Relations
            "user",
            "user_email",
            "order",
            "order_id",

            # Daraja identifiers
            "checkout_request_id",
            "merchant_request_id",
            "mpesa_receipt_number",

            # Payment details
            "phone_number",
            "amount",

            # Status / state machine
            "status",
            "processed",

            # Callback data
            "raw_callback",
            "result_code",
            "result_desc",

            # Metadata
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "user_email",
            "order_id",
        ]