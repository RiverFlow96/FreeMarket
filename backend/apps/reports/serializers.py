from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    reporter_username = serializers.CharField(
        source="reporter.username", read_only=True
    )

    class Meta:
        model = Report
        fields = [
            "id",
            "product",
            "product_name",
            "reporter",
            "reporter_username",
            "reason",
            "description",
            "created_at",
            "status",
        ]
        read_only_fields = [
            "reporter",
            "reporter_username",
            "created_at",
            "status",
        ]

    def validate(self, attrs):
        user = self.context["request"].user
        product = attrs.get("product")

        if product.seller == user:
            raise serializers.ValidationError("No puedes reportar tu propio producto")

        if Report.objects.filter(reporter=user, product=product).exists():
            raise serializers.ValidationError(
                "Ya has reportado este producto anteriormente"
            )

        return attrs

    def create(self, validated_data):
        validated_data["reporter"] = self.context["request"].user
        return super().create(validated_data)
