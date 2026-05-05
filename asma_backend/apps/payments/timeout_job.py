from django.utils import timezone
from datetime import timedelta
from apps.payments.models import PaymentTransaction

def expire_pending_transactions():
    threshold = timezone.now() - timedelta(minutes=5)
    pending = PaymentTransaction.objects.filter(
        status='PENDING',
        created_at__lt=threshold
    )
    for tx in pending:
        tx.status = 'FAILED'
        tx.processed = True
        tx.save()
        tx.order.status = 'failed'
        tx.order.save()
