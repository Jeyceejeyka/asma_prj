from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'category_name']


class ProductListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'product_name', 'price', 'stock_quantity', 'category_name', 'image', 'description']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'product_name', 'description', 'price', 'stock_quantity', 'category', 'image', 'created_at', 'updated_at']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None


class ProductWriteSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True, use_url=True)

    class Meta:
        model = Product
        fields = [
            'product_name',
            'description',
            'price',
            'stock_quantity',
            'category',
            'image'
        ]