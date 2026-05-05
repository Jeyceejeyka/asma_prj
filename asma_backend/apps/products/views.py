from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.viewsets import ModelViewSet
from rest_framework import permissions

from .models import Product, Category
from .serializers import (
    ProductListSerializer,
    ProductDetailSerializer,
    ProductWriteSerializer,
    CategorySerializer
)


# =========================
# PERMISSIONS
# =========================

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


# =========================
# PUBLIC VIEWS (READ-ONLY)
# =========================

class ProductListView(ListAPIView):
    """
    Public product list (optimized)
    - minimal fields
    - no N+1 queries
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductListSerializer

    def get_queryset(self):
        # pylint: disable=no-member
        return Product.objects.select_related('category').only(
            'id',
            'product_name',
            'price',
            'category__name'
        )


class ProductDetailView(RetrieveAPIView):
    """
    Public product detail (full data)
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = ProductDetailSerializer

    def get_queryset(self):
        # pylint: disable=no-member
        return Product.objects.select_related('category')


class CategoryListView(ListAPIView):
    """
    Public category list
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CategorySerializer

    def get_queryset(self):
        # pylint: disable=no-member
        return Category.objects.all()


# =========================
# ADMIN VIEWSETS (FULL CRUD)
# =========================

class ProductViewSet(ModelViewSet):
    """
    Admin product management
    Handles:
    - create
    - update
    - delete
    - list
    - retrieve
    """
    permission_classes = [IsAdmin]

    def get_queryset(self):
        # pylint: disable=no-member
        return Product.objects.select_related('category')

    def get_serializer_class(self):
        # Use lightweight serializer for writes
        if self.action in ['create', 'update', 'partial_update']:
            return ProductWriteSerializer

        # Use full serializer for reads
        return ProductDetailSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class CategoryViewSet(ModelViewSet):
    """
    Admin category management
    Handles:
    - create
    - update
    - delete
    - list
    - retrieve
    """
    permission_classes = [IsAdmin]

    def get_queryset(self):
        return Category.objects.all()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(updated_by=self.request.user)


class CategoryDetailView(RetrieveAPIView):
    """
    Public category detail
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = CategorySerializer

    def get_queryset(self):
        return Category.objects.all()