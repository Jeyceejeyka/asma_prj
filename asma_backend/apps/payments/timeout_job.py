from datetime import timedelta
from django.conf import settings
from django.db import transaction
from django.utils import timezone
from apps.payments.models import PaymentTransaction


def expire_pending_transaction(payment_id, *, now=None):
    """Cancel a stale STK request and release its reserved order items.

    The callback and this fallback both lock the transaction row, so only one
    terminal outcome can win when they arrive at nearly the same time.
    """
    now = now or timezone.now()
    threshold = now - timedelta(seconds=settings.PAYMENT_PENDING_TIMEOUT_SECONDS)

    with transaction.atomic():
        payment = PaymentTransaction.objects.select_for_update().select_related("order").get(pk=payment_id)
        if payment.status != PaymentTransaction.PENDING or payment.created_at > threshold:
            return payment

        payment.status = PaymentTransaction.CANCELLED
        payment.processed = True
        payment.result_desc = "The M-Pesa payment request timed out. Please try again."
        payment.save(update_fields=["status", "processed", "result_desc", "updated_at"])

        from apps.cart.services.checkout import CheckoutService

        CheckoutService(payment.user).release_stock(payment.order)
        payment.order.status = "failed"
        payment.order.save(update_fields=["status"])
        return payment


def expire_pending_transactions(*, now=None):
    """Expire every stale payment; suitable for a periodic job as well."""
    now = now or timezone.now()
    threshold = now - timedelta(seconds=settings.PAYMENT_PENDING_TIMEOUT_SECONDS)
    pending_ids = PaymentTransaction.objects.filter(
        status=PaymentTransaction.PENDING,
        created_at__lte=threshold,
    ).values_list("id", flat=True)
    return [expire_pending_transaction(payment_id, now=now) for payment_id in pending_ids]
