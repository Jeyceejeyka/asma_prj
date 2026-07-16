from django.db import transaction
from django.db.models import F
from apps.cart.models import Cart
from apps.products.models import Product
from apps.orders.models import Order, OrderItem
from apps.payments.models import PaymentTransaction
from apps.payments.services.daraja import DarajaService
from apps.utils.phone import normalize_phone


def initiate_payment(order, user, phone):
    print("apps/cart/services/checkout.py: initiate_payment phone=", phone, "order_id=", order.id, "amount=", order.total_price)
    try:
        phone = normalize_phone(phone)
        print("apps/cart/services/checkout.py: initiate_payment normalized phone=", phone)
        daraja = DarajaService()
        response = daraja.stk_push(
            phone=phone,
            amount=order.total_price,
            account_reference=f"ORDER-{order.id}",
            transaction_desc="Order Payment"
        )
        print("apps/cart/services/checkout.py: initiate_payment daraja response=", response)
        if 'CheckoutRequestID' not in response:
            raise ValueError('Failed to initiate STK push: no CheckoutRequestID in response')

        PaymentTransaction.objects.create(
            user=user,
            order=order,
            checkout_request_id=response['CheckoutRequestID'],
            merchant_request_id=response['MerchantRequestID'],
            phone_number=phone,
            amount=order.total_price,
            status='PENDING'
        )
        return response
    except Exception as e:
        print("apps/cart/services/checkout.py: initiate_payment EXCEPTION=", str(e))
        raise


class CheckoutService:
    def __init__(self, user):
        self.user = user

    def execute(self, idempotency_key=None):
        with transaction.atomic():
            cart = self._get_cart()
            items = self._get_locked_items(cart)
            self._validate_cart_not_empty(items)
            total_price, prepared_items = self._validate_and_prepare(items)
            # Idempotency: check for existing order with this key
            if idempotency_key:
                existing = Order.objects.filter(user=self.user, idempotency_key=idempotency_key).first()
                if existing:
                    return {
                        'order_id': existing.id,
                        'total_price': existing.total_price,
                        'items_count': existing.items.count()
                    }
            order = self._create_order(total_price, idempotency_key)
            self._create_order_items(order, prepared_items, reserved=True)
            self._reserve_stock(items)
            return {
                'order_id': order.id,
                'total_price': total_price,
                'items_count': len(prepared_items)
            }

    def _get_cart(self):
        cart, _ = Cart.objects.get_or_create(user=self.user)
        return cart

    def _get_locked_items(self, cart):
        return cart.items.select_related('products').select_for_update()

    def _validate_cart_not_empty(self, items):
        if not items.exists():
            raise ValueError('Cart is empty')

    def _validate_and_prepare(self, items):
        total_price = 0
        prepared_items = []
        for item in items:
            product = item.products
            if item.quantity > product.stock_quantity:
                raise ValueError(f'Insufficient stock for {product.product_name}')
            item_total = product.price * item.quantity
            total_price += item_total
            prepared_items.append({
                'product': product,
                'quantity': item.quantity,
                'price': product.price,
            })
        return total_price, prepared_items

    def _create_order(self, total_price, idempotency_key=None):
        return Order.objects.create(
            user=self.user,
            total_price=total_price,
            status='pending',
            idempotency_key=idempotency_key
        )

    def _create_order_items(self, order, prepared_items, reserved=True):
        order_items = [
            OrderItem(
                order=order,
                product=data['product'],
                quantity=data['quantity'],
                price=data['price'],
                reserved=reserved
            )
            for data in prepared_items
        ]
        OrderItem.objects.bulk_create(order_items)


    def _reserve_stock(self, items):
        # Optionally, add a field to Product for reserved stock if needed. For now, just check availability.
        for item in items:
            product = item.products
            if item.quantity > product.stock_quantity:
                raise ValueError(f'Insufficient stock for {product.product_name}')
            # Optionally, log reservation here
            # Actual deduction happens after payment confirmation

    # The following methods are now only used after payment confirmation or expiration/cancellation
    def deduct_stock(self, order):
        # Call this after payment confirmation
        for order_item in order.items.select_related('product').filter(reserved=True):
            Product.objects.filter(id=order_item.product.id).update(
                stock_quantity=F('stock_quantity') - order_item.quantity
            )
            order_item.reserved = False
            order_item.save(update_fields=['reserved'])

    def release_stock(self, order):
        # Call this on expiration/cancellation
        for order_item in order.items.select_related('product').filter(reserved=True):
            # No deduction needed, just mark as not reserved
            order_item.reserved = False
            order_item.save(update_fields=['reserved'])

    def _clear_cart(self, items):
        items.delete()
