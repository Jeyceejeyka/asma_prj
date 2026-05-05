from django.db import models


class PaymentTransaction(models.Model):
    # ---- STATUS STATE MACHINE ----
    PENDING = 'PENDING'
    SUCCESS = 'SUCCESS'
    FAILED = 'FAILED'
    CANCELLED = 'CANCELLED'

    STATUS_CHOICES = [
        (PENDING, 'Pending'),
        (SUCCESS, 'Success'),
        (FAILED, 'Failed'),
        (CANCELLED, 'Cancelled'),
    ]

    # ---- RELATIONS ----
    user = models.ForeignKey(
        'accounts.User',
        on_delete=models.CASCADE,
        related_name='payment_transactions'
    )

    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='transactions'
    )

    # ---- DARAJA IDENTIFIERS (IDEMPOTENCY CORE) ----
    checkout_request_id = models.CharField(
        max_length=100,
        unique=True,  # preventing duplicate processing
        db_index=True
    )

    merchant_request_id = models.CharField(
        max_length=100,
        db_index=True
    )

    # ---- PAYMENT DETAILS ----
    phone_number = models.CharField(max_length=20)  # normalized (2547...)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    mpesa_receipt_number = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        db_index=True
    )

    # ---- STATE CONTROL ----
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=PENDING,
        db_index=True
    )

    processed = models.BooleanField(
        default=False,
        help_text="Prevents duplicate callback processing"
    )

    # ---- CALLBACK / AUDIT ----
    raw_callback = models.JSONField(
        null=True,
        blank=True,
        help_text="Full Safaricom callback payload"
    )

    result_code = models.IntegerField(null=True, blank=True)
    result_desc = models.TextField(null=True, blank=True)

    # ---- METADATA ----
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['checkout_request_id', 'status']),
        ]

    def __str__(self):
        return f"TX-{self.checkout_request_id} | {self.status}"
