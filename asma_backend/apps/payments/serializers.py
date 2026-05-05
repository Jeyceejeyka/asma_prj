from rest_framework import serializers
from .models import PaymentTransaction

class PaymentTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentTransaction
        fields = ['id', 'order', 'amount', 'status', 'transaction_id', 'created_at']
        read_only_fields = ['id', 'created_at']