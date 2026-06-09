from celery import shared_task
from django.utils import timezone
from apps.cart.models import Cart
from apps.cart.services.checkout import CheckoutService
from apps.orders.models import Order

@shared_task
def expire_carts_and_release_stock():
    now = timezone.now()
    expired_carts = Cart.objects.filter(expires_at__lte=now)
    for cart in expired_carts:
        # Find any unpaid orders for this user with reserved items
        orders = Order.objects.filter(user=cart.user, status='pending')
        for order in orders:
            checkout_service = CheckoutService(cart.user)
            checkout_service.release_stock(order)
            order.status = 'cancelled'
            order.save()
        cart.delete()
