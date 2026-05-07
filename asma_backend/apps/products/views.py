from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import Product, Category
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
    CategorySerializer
)


# =========================
# PRODUCT VIEWSET
# =========================

class ProductViewSet(ModelViewSet):
    queryset = Product.objects.select_related('category')

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search', 'by_category']:
            return [AllowAny()]
        return [IsAdminUser()]

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductWriteSerializer
        return ProductDetailSerializer

    # 🔍 Search
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')

        if not query:
            return Response([])

        products = Product.objects.filter(
            Q(product_name__icontains=query) |
            Q(description__icontains=query)
        ).select_related('category')

        return Response(ProductListSerializer(products, many=True).data)

    # 📂 Products by category
    @action(detail=False, methods=['get'], url_path='category/(?P<category_id>[^/.]+)')
    def by_category(self, request, category_id=None):
        products = Product.objects.filter(category_id=category_id).select_related('category')
        return Response(ProductListSerializer(products, many=True).data)

    # 💰 Price filter
    @action(detail=False, methods=['get'])
    def price_range(self, request):
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')

        queryset = Product.objects.select_related('category')

        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        return Response(ProductListSerializer(queryset, many=True).data)

    # 📦 Stock filter
    @action(detail=False, methods=['get'])
    def in_stock(self, request):
        products = Product.objects.filter(stock_quantity__gt=0).select_related('category')
        return Response(ProductListSerializer(products, many=True).data)


# =========================
# CATEGORY VIEWSET
# =========================

class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'search']:
            return [AllowAny()]
        return [IsAdminUser()]

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')

        if not query:
            return Response([])

        categories = Category.objects.filter(category_name__icontains=query)
        return Response(CategorySerializer(categories, many=True).data)