from django.contrib import admin
from .models import Product, Category


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'product_name', 'price', 'stock_quantity', 'category', 'created_at')
    search_fields = ('product_name', 'description', 'category__category_name')
    list_filter = ('category', 'created_at')


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'category_name', 'created_at')
    search_fields = ('category_name',)