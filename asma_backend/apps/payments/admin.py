from django.contrib import admin
from .models import PaymentTransaction


@admin.register(PaymentTransaction)
class PaymentTransactionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user',
        'order',
        'checkout_request_id',
        'status',
        'amount',
        'created_at',
        'updated_at'
    )
    search_fields = (
        'checkout_request_id',
        'mpesa_receipt_number',
        'phone_number',
        'user__email'
    )
    list_filter = ('status', 'created_at', 'updated_at')
    readonly_fields = ('raw_callback',)
