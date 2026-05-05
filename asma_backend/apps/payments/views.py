from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from apps.payments.models import PaymentTransaction
from apps.payments.serializers import PaymentTransactionSerializer
from django.shortcuts import get_object_or_404


# DarajaCallbackView: Handles Safaricom Daraja callbacks (source of truth)
# Checklist: idempotency, strict validation, state machine, audit, concurrency safety
class DarajaCallbackView(APIView):
    permission_classes = []  # public endpoint

    @transaction.atomic
    def post(self, request):
        data = request.data
        try:
            callback = data['Body']['stkCallback']
            merchant_request_id = callback['MerchantRequestID']
            checkout_request_id = callback['CheckoutRequestID']
            result_code = callback['ResultCode']
            result_desc = callback['ResultDesc']
            metadata = callback.get('CallbackMetadata', {}).get('Item', [])

            # Parse metadata
            parsed_metadata = {
                item['Name']: item['Value']
                for item in metadata
                if 'Name' in item and 'Value' in item
            }

            # Lock row for concurrency safety
            payment_tx = (
                PaymentTransaction.objects
                .select_for_update()
                .get(checkout_request_id=checkout_request_id)
            )

            # Idempotency guard (optional but recommended)
            if payment_tx.processed:
                return Response(
                    {"message": "Already processed."},
                    status=status.HTTP_200_OK
                )

            # Update transaction
            payment_tx.status = 'SUCCESS' if result_code == 0 else 'FAILED'
            payment_tx.raw_callback = data
            payment_tx.result_code = result_code
            payment_tx.result_desc = result_desc
            # Only if you actually have this field in the model:
            # payment_tx.metadata = parsed_metadata

            payment_tx.processed = True
            payment_tx.save()

            return Response(
                {"message": "Callback processed successfully."},
                status=status.HTTP_200_OK
            )

        except KeyError:
            return Response(
                {"error": "Invalid callback format."},
                status=status.HTTP_400_BAD_REQUEST
            )
        except PaymentTransaction.DoesNotExist:
            return Response(
                {"error": "Transaction not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# ======== Admin Payments Views =========
# list of all payments
class AdminPaymentListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        payments = PaymentTransaction.objects.all()
        serializer = PaymentTransactionSerializer(payments, many=True)
        return Response(serializer.data)
    
# payment detail
class AdminPaymentDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, pk):
        payment = get_object_or_404(PaymentTransaction, pk=pk)
        serializer = PaymentTransactionSerializer(payment)
        return Response(serializer.data)
# delete payment
class AdminPaymentDeleteView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        payment = get_object_or_404(PaymentTransaction, pk=pk)
        payment.delete()
        return Response({'detail': 'Payment deleted.'}, status=status.HTTP_204_NO_CONTENT)
    
# list payments for a specific order
class AdminOrderPaymentsListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, order_id):
        payments = PaymentTransaction.objects.filter(order_id=order_id)
        serializer = PaymentTransactionSerializer(payments, many=True)
        return Response(serializer.data)
    
# list payments for a specific user
class AdminUserPaymentsListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, user_id):
        payments = PaymentTransaction.objects.filter(user_id=user_id)
        serializer = PaymentTransactionSerializer(payments, many=True)
        return Response(serializer.data)
    
    
# # refund payment (admin only)
# class AdminRefundPaymentView(APIView):
#     permission_classes = [permissions.IsAdminUser]

#     def post(self, request, pk):
#         payment = get_object_or_404(PaymentTransaction, pk=pk)
#         if payment.status != 'SUCCESS':
#             return Response({'detail': 'Only successful payments can be refunded.'}, status=400)
        
#         # Here you would integrate with the payment gateway to process the refund
#         # For now, we'll just update the status in our system
#         payment.status = 'REFUNDED'
#         payment.save()
#         return Response({'detail': 'Payment refunded.'})