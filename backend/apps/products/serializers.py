from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    seller_name = serializers.CharField(source="seller.username", read_only=True)
    seller_email = serializers.EmailField(source="seller.email", read_only=True)
    seller_phone = serializers.IntegerField(source="seller.phone", read_only=True)
    seller_address = serializers.CharField(source="seller.address", read_only=True)
    image = serializers.ImageField(use_url=True, required=False)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "currency",
            "category",
            "category_name",
            "image",
            "image_url",
            "seller_name",
            "seller_email",
            "seller_phone",
            "seller_address",
        ]
        read_only_fields = [
            "seller",
            "seller_name",
            "seller_email",
            "seller_phone",
            "seller_address",
            "category_name",
            "image_url",
        ]


# class ProductsGroupSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ProductsGroup
#         fields = "__all__"
