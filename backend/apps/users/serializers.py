from rest_framework import serializers
from .models import User
from .models import Plan


class UserSerializer(serializers.ModelSerializer):
    product_limit = serializers.IntegerField(read_only=True)
    product_count = serializers.IntegerField(read_only=True)
    can_add_product = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "address",
            "date_joined",
            "plan",
            "product_limit",
            "product_count",
            "can_add_product",
        ]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "phone", "address"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    product_limit = serializers.IntegerField(read_only=True)
    product_count = serializers.IntegerField(read_only=True)
    can_add_product = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "phone",
            "address",
            "plan",
            "product_limit",
            "product_count",
            "can_add_product",
        ]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)


class UpdatePlanSerializer(serializers.Serializer):
    plan = serializers.ChoiceField(choices=Plan.choices)
