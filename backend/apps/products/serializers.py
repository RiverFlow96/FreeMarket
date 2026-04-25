from rest_framework import serializers
from .models import Product, ProductsGroup


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class ProductsGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductsGroup
        fields = "__all__"
