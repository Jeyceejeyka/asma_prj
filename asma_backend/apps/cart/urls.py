from django.urls import path
from .views import (
    CartDetailView, CartItemAddView, CartItemUpdateDeleteView, 
    CartItemRemoveView, CartClearView, CartCheckoutView, AdminCartListView, AdminCartDetailView, 
    AdminCartDeleteView, AdminCartItemListView, 
    AdminCartItemDetailView, AdminCartItemDeleteView, AdminUserCartsListView, AdminCartItemUpdateView
)

urlpatterns = [
    path('', CartDetailView.as_view(), name='cart-detail'),
    path('add/', CartItemAddView.as_view(), name='cart-add-item'),
    path('item/<int:item_id>/', CartItemUpdateDeleteView.as_view(), name='cart-update-delete-item'),
    path('remove/<int:product_id>/', CartItemRemoveView.as_view(), name='cart-remove-item'),
    path('clear/', CartClearView.as_view(), name='cart-clear'),
    path('checkout/', CartCheckoutView.as_view(), name='cart-checkout'),
    path('admin/carts/', AdminCartListView.as_view(), name='admin-cart-list'),
    path('admin/carts/<int:cart_id>/', AdminCartDetailView.as_view(), name='admin-cart-detail'),
    path('admin/carts/<int:cart_id>/delete/', AdminCartDeleteView.as_view(), name='admin-cart-delete'),
    path('admin/carts/<int:cart_id>/items/', AdminCartItemListView.as_view(), name='admin-cart-items-list'),
    path('admin/carts/<int:cart_id>/items/<int:item_id>/', AdminCartItemDetailView.as_view(), name='admin-cart-item-detail'),
    path('admin/carts/<int:cart_id>/items/<int:item_id>/delete/', AdminCartItemDeleteView.as_view(), name='admin-cart-item-delete'),
    path('admin/users/<int:user_id>/carts/', AdminUserCartsListView.as_view(), name='admin-user-carts-list'),
]