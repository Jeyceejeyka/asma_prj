from django.db import transaction
from django.db.models import F

from apps.cart.models import Cart
from apps.products.models import Product
from apps.orders.models import Order, OrderItem  # adjust import if needed


class CheckoutService:
	def __init__(self, user):
		self.user = user

	def execute(self):
		with transaction.atomic():
			cart = self._get_cart()
			items = self._get_locked_items(cart)

			self._validate_cart_not_empty(items)

			total_price, prepared_items = self._validate_and_prepare(items)

			order = self._create_order(total_price)

			self._create_order_items(order, prepared_items)

			self._deduct_stock(items)

			self._clear_cart(items)

			return {
				'order_id': order.id,
				'total_price': total_price,
				'items_count': len(prepared_items)
			}

	# ---------------- PRIVATE METHODS ---------------- #

	def _get_cart(self):
		cart, _ = Cart.objects.get_or_create(user=self.user)
		return cart

	def _get_locked_items(self, cart):
		return (
			cart.items
			.select_related('products')
			.select_for_update()
		)

	def _validate_cart_not_empty(self, items):
		if not items.exists():
			raise ValueError('Cart is empty')

	def _validate_and_prepare(self, items):
		total_price = 0
		prepared_items = []

		for item in items:
			product = item.products

			if item.quantity > product.stock:
				raise ValueError(
					f'Insufficient stock for {product.name}'
				)

			item_total = product.price * item.quantity
			total_price += item_total

			prepared_items.append({
				'product': product,
				'quantity': item.quantity,
				'price': product.price
			})

		return total_price, prepared_items

	def _create_order(self, total_price):
		return Order.objects.create(
			user=self.user,
			total_price=total_price,
			status='pending'
		)

	def _create_order_items(self, order, prepared_items):
		order_items = [
			OrderItem(
				order=order,
				product=data['product'],
				quantity=data['quantity'],
				price=data['price']
			)
			for data in prepared_items
		]

		OrderItem.objects.bulk_create(order_items)

	def _deduct_stock(self, items):
		for item in items:
			Product.objects.filter(id=item.products.id).update(
				stock=F('stock') - item.quantity
			)

	def _clear_cart(self, items):
		items.delete()
