from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderDetailSerializer, OrderStatusUpdateSerializer, OrderItemSerializer
from django.shortcuts import get_object_or_404

# User: Create Order
class CreateOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = OrderSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save(user=request.user, user_email=request.user.email)
        return Response(OrderDetailSerializer(order).data, status=status.HTTP_201_CREATED)

# User: List Own Orders
class UserOrdersListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

# User: Order Detail
class OrderDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderDetailSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

# User: Cancel Order
class CancelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk, user=request.user)
        if order.status not in ['pending', 'processing']:
            return Response({'detail': 'Cannot cancel this order.'}, status=400)
        order.status = 'cancelled'
        order.save()
        return Response({'detail': 'Order cancelled.'})

# Admin: List All Orders
class AdminOrderListView(generics.ListAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = OrderSerializer
    queryset = Order.objects.all()

# Admin: Order Detail
class AdminOrderDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAdminUser]
    serializer_class = OrderDetailSerializer
    queryset = Order.objects.all()

# Admin: Update Order Status
class UpdateOrderStatusView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        serializer = OrderStatusUpdateSerializer(order, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(OrderDetailSerializer(order).data)
# Admin: Delete Order
class DeleteOrderView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def delete(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        order.delete()
        return Response({'detail': 'Order deleted.'}, status=status.HTTP_204_NO_CONTENT)


# Admin: List Order Items
class AdminOrderItemsListView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        items = order.items.all()
        serializer = OrderItemSerializer(items, many=True)
        return Response(serializer.data)


# Admin: Order Item Detail
class AdminOrderItemDetailView(APIView):
    permission_classes = [permissions.IsAdminUser]

    def get(self, request, order_id, item_id):
        order = get_object_or_404(Order, id=order_id)
        item = get_object_or_404(OrderItem, id=item_id, order=order)
        serializer = OrderItemSerializer(item)
        return Response(serializer.data)
