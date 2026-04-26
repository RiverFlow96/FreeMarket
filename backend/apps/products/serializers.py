from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["name", "description", "price", "category", "image", "seller"]


# class ProductsGroupSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ProductsGroup
#         fields = "__all__"
