from django.contrib import admin
from .models import Order, OrderItem
# Register your models here.
@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'status', 'created_at')
    search_fields = ('user__email', 'user__username')
    list_filter = ('status', 'created_at')

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'product', 'quantity', 'price')
    search_fields = ('order__user__email', 'order__user__username', 'product__name')
    list_filter = ('created_at',)