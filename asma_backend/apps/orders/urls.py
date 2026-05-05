from django.urls import path
from .views import (
    CreateOrderView, UserOrdersListView, OrderDetailView, CancelOrderView,
    AdminOrderListView, AdminOrderDetailView, UpdateOrderStatusView
)

urlpatterns = [
    # Authenticated user endpoints
    path('create/', CreateOrderView.as_view(), name='create-order'),
    path('my-orders/', UserOrdersListView.as_view(), name='user-orders'),
    path('<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('<int:pk>/cancel/', CancelOrderView.as_view(), name='cancel-order'),
    # Admin endpoints
    path('admin/orders/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/orders/<int:pk>/', AdminOrderDetailView.as_view(), name='admin-order-detail'),
    path('admin/orders/<int:pk>/update-status/', UpdateOrderStatusView.as_view(), name='update-order-status'),
]