from django.contrib import admin
from .models import Cart, CartItem

# Register your models here.
admin.site.register(Cart)
list_display = ('id', 'user', 'created_at', 'updated_at')
search_fields = ('user__email', 'user__username')
list_filter = ('created_at', 'updated_at')

admin.site.register(CartItem)
list_display = ('id', 'cart', 'products', 'quantity', 'created_at', 'updated_at')
search_fields = ('cart__user__email', 'cart__user__username', 'products__name')
list_filter = ('created_at', 'updated_at')  