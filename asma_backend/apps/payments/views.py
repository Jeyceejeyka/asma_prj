from decimal import Decimal, InvalidOperation

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.db import transaction
from apps.payments.models import PaymentTransaction
from apps.payments.serializers import PaymentTransactionSerializer
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework import permissions


def _parse_callback_metadata(callback):
    metadata = callback.get('CallbackMetadata', {}).get('Item', [])
    if not isinstance(metadata, list):
        return {}

    parsed = {}
    for item in metadata:
        if not isinstance(item, dict):
            continue
        name = item.get('Name')
        value = item.get('Value')
        if name is not None and value is not None:
            parsed[str(name)] = value
    return parsed


# DarajaCallbackView: Handles Safaricom Daraja callbacks (source of truth)
# Checklist: idempotency, strict validation, state machine, audit, concurrency safety
class DarajaCallbackView(APIView):
    permission_classes = []  # public endpoint

    @transaction.atomic
    def post(self, request):
        data = request.data
        print("apps/payments/views.py: Daraja callback received:", data)
        try:
            callback = data['Body']['stkCallback']
            merchant_request_id = callback['MerchantRequestID']
            checkout_request_id = callback['CheckoutRequestID']
            result_code = int(callback['ResultCode'])
            result_desc = callback['ResultDesc']
            metadata = _parse_callback_metadata(callback)
            print(
                "apps/payments/views.py: parsed callback =>",
                {
                    'merchant_request_id': merchant_request_id,
                    'checkout_request_id': checkout_request_id,
                    'result_code': result_code,
                    'result_desc': result_desc,
                    'metadata': metadata,
                },
            )

            # Lock row for concurrency safety
            payment_tx = (
                PaymentTransaction.objects
                .select_for_update()
                .get(checkout_request_id=checkout_request_id)
            )

            # Validate transaction reference consistency before trusting the callback.
            if payment_tx.merchant_request_id and merchant_request_id != payment_tx.merchant_request_id:
                return Response(
                    {'error': 'MerchantRequestID does not match the stored transaction.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Idempotency guard: callback replay is not a new payment outcome.
            if payment_tx.processed:
                return Response(
                    {
                        'message': 'Already processed.',
                        'status': payment_tx.status,
                        'checkoutRequestId': payment_tx.checkout_request_id,
                        'receipt': payment_tx.mpesa_receipt_number,
                    },
                    status=status.HTTP_200_OK,
                )

            amount_value = metadata.get('Amount')
            if amount_value is not None:
                try:
                    callback_amount = Decimal(str(amount_value))
                except (InvalidOperation, TypeError, ValueError):
                    return Response({'error': 'Invalid callback amount.'}, status=status.HTTP_400_BAD_REQUEST)
                if callback_amount != payment_tx.amount:
                    return Response({'error': 'Callback amount does not match the pending transaction amount.'}, status=status.HTTP_400_BAD_REQUEST)

            phone_value = metadata.get('PhoneNumber')
            if phone_value is not None:
                callback_phone = str(phone_value).strip()
                if callback_phone and callback_phone != payment_tx.phone_number:
                    return Response({'error': 'Callback phone number does not match the pending transaction phone.'}, status=status.HTTP_400_BAD_REQUEST)

            if result_code == 0:
                receipt = metadata.get('MpesaReceiptNumber') or metadata.get('ReceiptNumber')
                if not receipt or not str(receipt).strip():
                    return Response({'error': 'Successful callback missing M-Pesa receipt number.'}, status=status.HTTP_400_BAD_REQUEST)
                payment_tx.status = PaymentTransaction.SUCCESS
                payment_tx.mpesa_receipt_number = str(receipt).strip()
            elif result_code == 1032:
                payment_tx.status = PaymentTransaction.CANCELLED
            else:
                payment_tx.status = PaymentTransaction.FAILED

            payment_tx.raw_callback = data
            payment_tx.result_code = result_code
            payment_tx.result_desc = result_desc
            payment_tx.processed = True
            payment_tx.save()

            order = payment_tx.order
            from apps.cart.services.checkout import CheckoutService
            checkout_service = CheckoutService(payment_tx.user)
            if result_code == 0:
                checkout_service.deduct_stock(order)
            else:
                checkout_service.release_stock(order)

            if payment_tx.status == PaymentTransaction.SUCCESS:
                order.status = 'paid'
            elif payment_tx.status in (PaymentTransaction.CANCELLED, PaymentTransaction.FAILED):
                order.status = 'failed'
            order.save(update_fields=['status'])

            return Response(
                {
                    'message': 'Callback processed successfully.',
                    'status': payment_tx.status,
                    'checkoutRequestId': payment_tx.checkout_request_id,
                    'receipt': payment_tx.mpesa_receipt_number,
                },
                status=status.HTTP_200_OK,
            )

        except KeyError:
            return Response(
                {'error': 'Invalid callback format.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except PaymentTransaction.DoesNotExist:
            return Response(
                {'error': 'Transaction not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PaymentStatusView(APIView):
    """Public endpoint for frontend to poll payment status by checkout_request_id.

    Query params: ?checkout_request_id=...
    Requires authentication and ensures the requesting user owns the payment or is admin.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        checkout_request_id = request.query_params.get('checkout_request_id')
        print("apps/payments/views.py: PaymentStatusView.get checkout_request_id=", checkout_request_id, "user=", request.user.id)
        if not checkout_request_id:
            return Response({'detail': 'Missing checkout_request_id'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            payment = PaymentTransaction.objects.get(checkout_request_id=checkout_request_id)
        except PaymentTransaction.DoesNotExist:
            print("apps/payments/views.py: PaymentStatusView.get transaction not found for id=", checkout_request_id)
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)

        # Authorization: only owner or admin can view
        if payment.user_id != request.user.id and not request.user.is_staff:
            return Response({'detail': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)

        # A callback is the source of truth, but a tunnel/network failure must
        # not leave a customer polling a PENDING payment indefinitely.
        from apps.payments.timeout_job import expire_pending_transaction

        payment = expire_pending_transaction(payment.id)

        serializer = PaymentTransactionSerializer(payment)
        return Response({
            'status': payment.status,
            'message': payment.result_desc or (
                'Payment pending confirmation.' if payment.status == PaymentTransaction.PENDING else
                'M-Pesa payment request is in progress.'
            ),
            'checkoutRequestId': payment.checkout_request_id,
            'receipt': payment.mpesa_receipt_number,
            'transactionId': payment.id,
            'isSuccessful': payment.status == PaymentTransaction.SUCCESS,
            'isPending': payment.status == PaymentTransaction.PENDING,
            'data': serializer.data,
        })


class UserPaymentHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        payments = PaymentTransaction.objects.filter(user=request.user).order_by('-created_at')
        serializer = PaymentTransactionSerializer(payments, many=True)
        return Response({
            'count': payments.count(),
            'results': serializer.data,
            'items': serializer.data,
        })

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
