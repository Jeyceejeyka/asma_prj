from django.urls import path
from .views import (
    DarajaCallbackView,
    AdminPaymentListView,
    AdminPaymentDetailView,
    AdminPaymentDeleteView,
    AdminOrderPaymentsListView,
    AdminUserPaymentsListView,
    PaymentStatusView,
)

urlpatterns = [
    path('daraja/callback/', DarajaCallbackView.as_view(), name='daraja-callback'),
    path('status/', PaymentStatusView.as_view(), name='payment-status'),
    path('admin/payments/', AdminPaymentListView.as_view(), name='admin-payments'),
    path('admin/payments/<int:pk>/', AdminPaymentDetailView.as_view(), name='admin-payment-detail'),
    path('admin/payments/<int:pk>/delete/', AdminPaymentDeleteView.as_view(), name='admin-payment-delete'),
    path('admin/orders/<int:order_id>/payments/', AdminOrderPaymentsListView.as_view(), name='admin-order-payments'),
    path('admin/users/<int:user_id>/payments/', AdminUserPaymentsListView.as_view(), name='admin-user-payments'),
]
