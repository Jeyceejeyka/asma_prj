from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import F
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer, CartItemWriteSerializer
from apps.products.models import Product
from apps.cart.services.checkout import initiate_payment, CheckoutService
from apps.orders.models import Order

# Helper to get or create cart for user
def get_user_cart(user):
    from django.utils import timezone
    from datetime import timedelta
    cart, created = Cart.objects.get_or_create(user=user)  #type: ignore[attr-defined]
    # Set/refresh expiration (e.g., 30 min from now)
    cart.expires_at = timezone.now() + timedelta(minutes=30)
    cart.save(update_fields=["expires_at"])
    return cart


class CartDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart = get_user_cart(request.user)
        items = cart.items.all()
        total_price = sum(item.products.price * item.quantity for item in items)
        total_items = sum(item.quantity for item in items)
        data = CartSerializer(cart).data
        data['total_price'] = total_price
        data['total_items'] = total_items
        return Response(data)

class CartClearView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        cart = get_user_cart(request.user)
        cart.items.all().delete()
        return Response({'detail': 'Cart cleared.'}, status=status.HTTP_200_OK)

class CartItemAddView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = CartItemWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = get_user_cart(request.user)
        product = get_object_or_404(Product, id=serializer.validated_data['product_id'])
        quantity = serializer.validated_data['quantity']

        item, created = CartItem.objects.select_for_update().get_or_create(
            cart=cart,
            products=product,
            defaults={"quantity": quantity},
        )

        if not created:
            CartItem.objects.filter(pk=item.pk).update(quantity=F("quantity") + quantity)
            item.refresh_from_db()
        else:
            item.quantity = quantity
            item.save(update_fields=["quantity"])

        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)

class CartItemUpdateDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, item_id):
        cart = get_user_cart(request.user)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        quantity = request.data.get('quantity')
        if quantity is not None and int(quantity) > 0:
            item.quantity = int(quantity)
            item.save()
            return Response(CartItemSerializer(item).data)
        return Response({'detail': 'Invalid quantity.'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, item_id):
        cart = get_user_cart(request.user)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        item.delete()
        return Response({'detail': 'Item removed.'}, status=status.HTTP_204_NO_CONTENT)

class CartItemRemoveView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, product_id):
        cart = get_user_cart(request.user)
        item = get_object_or_404(CartItem, cart=cart, products__id=product_id)
        item.delete()
        return Response({'detail': 'Item removed.'}, status=status.HTTP_204_NO_CONTENT)

class CartCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        print("apps/cart/views.py: CartCheckoutView.post user=", getattr(request.user, 'id', None))
        print("apps/cart/views.py: CartCheckoutView.post request.data=", request.data)
        print("apps/cart/views.py: CartCheckoutView.post request.headers Idempotency-Key=", request.headers.get('Idempotency-Key'))

        # Idempotency key from header or body
        idempotency_key = request.headers.get('Idempotency-Key') or request.data.get('idempotency_key')
        if not idempotency_key:
            return Response({'detail': 'Missing Idempotency-Key'}, status=400)

        phone = request.data.get("phone")
        print("apps/cart/views.py: CartCheckoutView.post payment phone=", phone)
        if not phone:
            return Response(
                {"detail": "Phone number is required"},
                status=400
            )

        service = CheckoutService(user=request.user)
        try:
            result = service.execute(idempotency_key=idempotency_key)
            print("apps/cart/views.py: CartCheckoutView.post checkout service result=", result)
            order = Order.objects.get(id=result['order_id'])

            # 🔒 Prevent double payment
            if order.transactions.filter(status='PENDING').exists():
                return Response({'detail': 'Payment already in progress'}, status=400)

            # 2. Initiate STK push
            payment_response = initiate_payment(
                order,
                request.user,
                phone
            )
            print("apps/cart/views.py: CartCheckoutView.post payment_response=", payment_response)

            return Response({
                'status': 'PENDING',
                'detail': 'STK push sent',
                'message': 'Payment initiated. Awaiting M-Pesa confirmation before treating this as successful.',
                'checkout_request_id': payment_response['CheckoutRequestID'],
                'checkoutRequestId': payment_response['CheckoutRequestID'],
                'transaction_status': 'PENDING',
            }, status=200)
        except ValueError as e:
            print("apps/cart/views.py: CartCheckoutView.post validation error=", str(e))
            return Response({'detail': str(e)}, status=400)
        except Exception as e:
            print("apps/cart/views.py: CartCheckoutView.post unexpected error=", str(e))
            return Response({'detail': 'Internal server error', 'error': str(e)}, status=500)


# =========== Admin Cart Views ===========

# Admin: List all carts
class AdminCartListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_staff:
            return Response({'detail': 'Not authorized'}, status=403)
        carts = Cart.objects.all()
        serializer = CartSerializer(carts, many=True)
        return Response(serializer.data)

class AdminCartDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, cart_id):
        if not request.user.is_staff:
            return Response({'detail': 'Not authorized'}, status=403)
        cart = get_object_or_404(Cart, id=cart_id)
        serializer = CartSerializer(cart)
        return Response(serializer.data)    
    
class AdminCartItemListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, cart_id):
        if not request.user.is_staff:
            return Response({'detail': 'Not authorized'}, status=403)
        cart = get_object_or_404(Cart, id=cart_id)
        items = cart.items.all()
        serializer = CartItemSerializer(items, many=True)
        return Response(serializer.data)
    
class AdminCartItemDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, cart_id, item_id):
        if not request.user.is_staff:
            return Response({'detail': 'Not authorized'}, status=403)
        cart = get_object_or_404(Cart, id=cart_id)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        serializer = CartItemSerializer(item)
        return Response(serializer.data)
    
class AdminCartItemDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, cart_id, item_id):
        if not request.user.is_staff:
            return Response({'detail': 'Not authorized'}, status=403)
        cart = get_object_or_404(Cart, id=cart_id)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        item.delete()
        return Response({'detail': 'Item deleted.'}, status=status.HTTP_204_NO_CONTENT)
    
class AdminCartDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, cart_id):
        if not request.user.is_staff:
            return Response({'detail': 'Not authorized'}, status=403)
        cart = get_object_or_404(Cart, id=cart_id)
        cart.delete()
        return Response({'detail': 'Cart deleted.'}, status=status.HTTP_204_NO_CONTENT)
    
class AdminCartItemUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, cart_id, item_id):
        if not request.user.is_staff:
            return Response({'detail': 'Not authorized'}, status=403)
        cart = get_object_or_404(Cart, id=cart_id)
        item = get_object_or_404(CartItem, id=item_id, cart=cart)
        quantity = request.data.get('quantity')
        if quantity is not None and int(quantity) > 0:
            item.quantity = int(quantity)
            item.save()
            serializer = CartItemSerializer(item)
            return Response(serializer.data)
        return Response({'detail': 'Invalid quantity.'}, status=status.HTTP_400_BAD_REQUEST)
    
class AdminUserCartsListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        if not request.user.is_staff:
            return Response({'detail': 'Not authorized'}, status=403)
        carts = Cart.objects.filter(user_id=user_id)
        serializer = CartSerializer(carts, many=True)
        return Response(serializer.data)