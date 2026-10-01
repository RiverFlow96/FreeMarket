from rest_framework import serializers
from .models import Product, ProductImage


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["id", "image"]


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source="category.name", read_only=True)
    seller_name = serializers.CharField(source="seller.username", read_only=True)
    seller_id = serializers.IntegerField(source="seller.id", read_only=True)
    seller_email = serializers.EmailField(source="seller.email", read_only=True)
    seller_phone = serializers.IntegerField(source="seller.phone", read_only=True)
    seller_address = serializers.CharField(source="seller.address", read_only=True)
    image = serializers.SerializerMethodField()
    images = ProductImageSerializer(many=True, read_only=True)
    is_expired = serializers.BooleanField(read_only=True)

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
            "images",
            "image_url",
            "seller_id",
            "seller_name",
            "seller_email",
            "seller_phone",
            "seller_address",
            "created_at",
            "expires_at",
            "is_active",
            "is_expired",
        ]
        extra_kwargs = {
            "description": {"required": False, "allow_blank": True},
            "category": {"required": False, "allow_null": True},
        }
        read_only_fields = [
            "seller",
            "seller_id",
            "seller_name",
            "seller_email",
            "seller_phone",
            "seller_address",
            "category_name",
            "image_url",
            "images",
            "created_at",
            "expires_at",
            "is_active",
            "is_expired",
        ]

    def get_image(self, obj):
        first_image = obj.images.first()
        if first_image:
            return first_image.image.url
        if obj.image:
            return obj.image.url
        if obj.image_url:
            return obj.image_url
        return None


# class ProductsGroupSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = ProductsGroup
#         fields = "__all__"
