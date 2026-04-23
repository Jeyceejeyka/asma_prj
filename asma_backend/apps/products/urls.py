from django.shortcuts import render
from django.urls import path
from .views import (
    ProductListView,
    ProductDetailView,
    CategoryListView,
    ProductViewSet,
    CategoryViewSet
)



urlpatterns = [
    path('products/', ProductListView.as_view(), name=('product_list')),
    path('products/<int:pk>/', ProductDetailView.as_view(), name=('product_detail')),
    path('categories/', CategoryListView.as_view(), name=('category_list')),
    path('admin/products/', ProductViewSet.as_view({'get': 'list'}), name=('admin_product_list')),
    path('admin/categories/', CategoryViewSet.as_view({'get': 'list'}), name=('admin_category_list')),

]
