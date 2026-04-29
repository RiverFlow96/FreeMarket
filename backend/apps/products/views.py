from .models import Product
from .serializers import ProductSerializer
from .permissions import IsAdminOrOwner
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework import serializers


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]

    def get_permissions(self):
        if self.action in ["list", "retrieve", "search"]:
            return [AllowAny()]
        return super().get_permissions()

    def get_queryset(self):
        if self.request.user.is_staff:
            return Product.objects.all()
        if self.request.user.is_authenticated:
            return Product.objects.all()
        return Product.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if not user.can_add_product:
            from django.utils.translation import gettext_lazy as _

            raise serializers.ValidationError(
                {
                    "error": _(
                        f"Has alcanzado el límite de {user.product_limit} productos. "
                        f"Upgradea tu plan para agregar más productos."
                    )
                }
            )
        serializer.save(seller=user)

    @action(detail=False, methods=["get"], url_path="search")
    def search(self, request):
        query = request.query_params.get("search", "")
        if query:
            products = Product.objects.filter(name__icontains=query)
        else:
            products = Product.objects.all()
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=["delete"], permission_classes=[IsAuthenticated])
    def delete_product(self, request, pk=None):
        product = self.get_object()
        if product.seller != request.user and not request.user.is_staff:
            return Response(
                {"error": "No tienes permiso para eliminar este producto."},
                status=status.HTTP_403_FORBIDDEN,
            )
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my_plan(self, request):
        user = request.user
        return Response(
            {
                "plan": user.plan,
                "product_limit": user.product_limit,
                "product_count": user.product_count,
                "can_add_product": user.can_add_product,
            }
        )
