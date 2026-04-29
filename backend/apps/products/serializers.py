from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    seller_name = serializers.CharField(source="seller.username", read_only=True)
    seller_email = serializers.EmailField(source="seller.email", read_only=True)
    seller_phone = serializers.IntegerField(source="seller.phone", read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "price",
            "category",
            "category_name",
            "image",
            "seller_name",
            "seller_email",
            "seller_phone",
        ]
        extra_kwargs = {
            "image": {"read_only": True},
        }

    def get_image(self, obj):
        return obj.display_image


# class ProductsGroupSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ProductsGroup
#         fields = "__all__"
