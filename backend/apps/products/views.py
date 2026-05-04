from .models import Product, ProductImage
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
        public_actions = ["list", "retrieve"]
        if self.action in public_actions:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = Product.objects.select_related(
            "category", "seller"
        ).prefetch_related("images")

        # Search filter - ahora como query param ?search= en lugar de acción
        search = self.request.query_params.get("search", None)
        if search:
            queryset = queryset.filter(name__icontains=search)

        # Category filter
        category = self.request.query_params.get("category", None)
        if category:
            queryset = queryset.filter(category__name=category)

        # Price range filter
        min_price = self.request.query_params.get("min_price", None)
        max_price = self.request.query_params.get("max_price", None)
        if min_price:
            queryset = queryset.filter(price__gte=float(min_price))
        if max_price:
            queryset = queryset.filter(price__lte=float(max_price))

        # Sorting
        sort = self.request.query_params.get("sort", None)
        if sort == "price_asc":
            queryset = queryset.order_by("price")
        elif sort == "price_desc":
            queryset = queryset.order_by("-price")
        elif sort == "name_asc":
            queryset = queryset.order_by("name")
        elif sort == "name_desc":
            queryset = queryset.order_by("-name")

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Paginación
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 20))
        page_size = min(page_size, 100)  # Max 100 items

        total = queryset.count()
        pages = (total + page_size - 1) // page_size if total > 0 else 0
        offset = (page - 1) * page_size
        products = queryset[offset : offset + page_size]

        serializer = self.get_serializer(products, many=True)

        # Compatibilidad hacia atrás: incluye results para frontend legacy
        response_data = serializer.data
        return Response(
            {
                "success": True,
                "data": response_data,
                "results": response_data,
                "pagination": {
                    "total": total,
                    "page": page,
                    "page_size": page_size,
                    "pages": pages,
                },
            }
        )

    def create(self, request, *args, **kwargs):
        images = request.FILES.getlist("images")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = request.user
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

        product = serializer.save(seller=user)

        for image in images:
            ProductImage.objects.create(product=product, image=image)

        return Response(
            {
                "success": True,
                "data": self.get_serializer(product).data,
                "message": "Producto creado exitosamente",
            },
            status=status.HTTP_201_CREATED,
        )

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

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        if product.seller_id != request.user.id and not request.user.is_staff:
            return Response(
                {
                    "success": False,
                    "error": "No tienes permiso para eliminar este producto.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        product.delete()
        return Response(
            {"success": True, "message": "Producto eliminado exitosamente"},
            status=status.HTTP_204_NO_CONTENT,
        )

    def partial_update(self, request, *args, **kwargs):
        """Override partial_update to return consistent response format"""
        product = self.get_object()
        if product.seller_id != request.user.id and not request.user.is_staff:
            return Response(
                {
                    "success": False,
                    "error": "No tienes permiso para modificar este producto.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = self.get_serializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            {
                "success": True,
                "data": serializer.data,
                "message": "Producto actualizado exitosamente",
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def my_plan(self, request):
        user = request.user
        return Response(
            {
                "success": True,
                "data": {
                    "plan": user.plan,
                    "product_limit": user.product_limit,
                    "product_count": user.product_count,
                    "can_add_product": user.can_add_product,
                    "product_duration_weeks": user.product_duration_weeks,
                    "notification_preference": user.notification_preference,
                },
            }
        )

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def add_image(self, request, pk=None):
        """Upload image to product"""
        product = self.get_object()
        if product.seller_id != request.user.id and not request.user.is_staff:
            return Response(
                {
                    "success": False,
                    "error": "No tienes permiso para modificar este producto.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        image_file = request.FILES.get("image")
        if not image_file:
            return Response(
                {"success": False, "error": "No se proporcionó ninguna imagen."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product_image = ProductImage.objects.create(product=product, image=image_file)

        return Response(
            {
                "success": True,
                "data": {
                    "id": product_image.id,
                    "image": product_image.image.url,
                },
                "message": "Imagen agregada exitosamente",
            },
            status=status.HTTP_201_CREATED,
        )

        # Return debug info BEFORE any permission checks
        return Response(
            {
                "success": False,
                "debug": {
                    "user_id": request.user.id if request.user else None,
                    "is_authenticated": request.user.is_authenticated
                    if request.user
                    else False,
                    "user": str(request.user),
                    "auth_header": request.META.get("HTTP_AUTHORIZATION", "NONE")[:50],
                },
            },
            status=200,
        )
        logger.error(
            f"[add_image] Auth header: {request.META.get('HTTP_AUTHORIZATION', 'NO AUTH HEADER')}"
        )
        logger.error(
            f"[add_image] Request method: {request.method}, Path: {request.path}"
        )

        product = self.get_object()
        if product.seller_id != request.user.id and not request.user.is_staff:
            return Response(
                {
                    "success": False,
                    "error": "No tienes permiso para modificar este producto.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        image_file = request.FILES.get("image")
        if not image_file:
            return Response(
                {"success": False, "error": "No se proporcionó ninguna imagen."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product_image = ProductImage.objects.create(product=product, image=image_file)

        return Response(
            {
                "success": True,
                "data": {
                    "id": product_image.id,
                    "image": product_image.image.url,
                },
                "message": "Imagen agregada exitosamente",
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["delete"], permission_classes=[IsAuthenticated])
    def delete_image(self, request, pk=None):
        product = self.get_object()
        if product.seller_id != request.user.id and not request.user.is_staff:
            return Response(
                {
                    "success": False,
                    "error": "No tienes permiso para modificar este producto.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        image_id = request.query_params.get("image_id")
        if not image_id:
            return Response(
                {"success": False, "error": "Se requiere el ID de la imagen."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            product_image = ProductImage.objects.get(id=image_id, product=product)
            product_image.delete()
            return Response(
                {"success": True, "message": "Imagen eliminada exitosamente"},
            )
        except ProductImage.DoesNotExist:
            return Response(
                {"success": False, "error": "La imagen no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )
        product = self.get_object()
        if product.seller_id != request.user.id and not request.user.is_staff:
            return Response(
                {
                    "success": False,
                    "error": "No tienes permiso para modificar este producto.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        image_file = request.FILES.get("image")
        if not image_file:
            return Response(
                {"success": False, "error": "No se proporcionó ninguna imagen."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        product_image = ProductImage.objects.create(product=product, image=image_file)

        return Response(
            {
                "success": True,
                "data": {
                    "id": product_image.id,
                    "image": product_image.image.url,
                },
                "message": "Imagen agregada exitosamente",
            },
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["delete"], permission_classes=[IsAuthenticated])
    def delete_image(self, request, pk=None):
        product = self.get_object()
        if product.seller_id != request.user.id and not request.user.is_staff:
            return Response(
                {
                    "success": False,
                    "error": "No tienes permiso para modificar este producto.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        image_id = request.query_params.get("image_id")
        if not image_id:
            return Response(
                {"success": False, "error": "Se requiere el ID de la imagen."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            product_image = ProductImage.objects.get(id=image_id, product=product)
            product_image.delete()
            return Response(
                {"success": True, "message": "Imagen eliminada exitosamente"},
            )
        except ProductImage.DoesNotExist:
            return Response(
                {"success": False, "error": "La imagen no existe."},
                status=status.HTTP_404_NOT_FOUND,
            )
