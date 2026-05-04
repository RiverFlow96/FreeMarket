from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import permissions
from django.utils import timezone

from apps.products.models import Product, GRACE_PERIOD_HOURS
from apps.products.serializers import ProductSerializer

from .models import User, NotificationPreference
from .serializers import (
    UserSerializer,
    UserCreateSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    UpdatePlanSerializer,
)


class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.is_staff


class UserViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsAdminOrReadOnly]
    serializer_class = UserSerializer
    queryset = User.objects.all()

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        if self.action in ["profile", "change_password", "my_products", "update_plan"]:
            return [IsAuthenticated()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == "create":
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        if self.request.user.is_staff:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Solo admin puede listar todos los usuarios
        if not request.user.is_staff:
            return Response(
                {"success": False, "error": "No tienes permiso para listar usuarios."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Paginación
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 20))
        page_size = min(page_size, 100)

        total = queryset.count()
        pages = (total + page_size - 1) // page_size if total > 0 else 0
        offset = (page - 1) * page_size
        users = queryset[offset : offset + page_size]

        serializer = self.get_serializer(users, many=True)

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

    @action(detail=False, methods=["get", "put", "patch"], url_path="me")
    def profile(self, request):
        user = request.user
        if request.method == "GET":
            serializer = UserProfileSerializer(user)
            return Response({"success": True, "data": serializer.data})

        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            if "email" in request.data:
                user.email = request.data["email"]
            if "phone" in request.data:
                user.phone = request.data["phone"]
            if "address" in request.data:
                user.address = request.data["address"]
            if "notification_preference" in request.data:
                if (
                    request.data["notification_preference"]
                    in NotificationPreference.values
                ):
                    user.notification_preference = request.data[
                        "notification_preference"
                    ]
            user.save()
            return Response(
                {
                    "success": True,
                    "data": UserProfileSerializer(user).data,
                    "message": "Perfil actualizado exitosamente",
                }
            )
        return Response(
            {
                "success": False,
                "error": "Error de validación",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=False, methods=["post"], url_path="me/password")
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data["old_password"]
            new_password = serializer.validated_data["new_password"]

            if not user.check_password(old_password):
                return Response(
                    {"success": False, "error": "La contraseña actual es incorrecta."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.set_password(new_password)
            user.save()
            return Response(
                {"success": True, "message": "Contraseña cambiada exitosamente."}
            )

        return Response(
            {
                "success": False,
                "error": "Error de validación",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    @action(detail=False, methods=["get"], url_path="me/products")
    def my_products(self, request):
        queryset = Product.objects.filter(seller=request.user)

        # Paginación
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 20))
        page_size = min(page_size, 100)

        total = queryset.count()
        pages = (total + page_size - 1) // page_size if total > 0 else 0
        offset = (page - 1) * page_size
        products = queryset.select_related("category").prefetch_related("images")[
            offset : offset + page_size
        ]

        serializer = ProductSerializer(products, many=True)

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

    @action(detail=False, methods=["get"])
    def all_products(self, request):
        if not request.user.is_staff:
            return Response(
                {
                    "success": False,
                    "error": "No tienes permiso para ver todos los productos.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        queryset = Product.objects.select_related(
            "category", "seller"
        ).prefetch_related("images")

        # Paginación
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 20))
        page_size = min(page_size, 100)

        total = queryset.count()
        pages = (total + page_size - 1) // page_size if total > 0 else 0
        offset = (page - 1) * page_size
        products = queryset[offset : offset + page_size]

        serializer = ProductSerializer(products, many=True)

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

    @action(detail=False, methods=["post"])
    def update_plan(self, request):
        serializer = UpdatePlanSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            user.plan = serializer.validated_data["plan"]
            user.save()
            return Response(
                {
                    "success": True,
                    "message": "Plan actualizado exitosamente.",
                    "data": {
                        "plan": user.plan,
                        "product_limit": user.product_limit,
                        "product_duration_weeks": user.product_duration_weeks,
                    },
                }
            )
        return Response(
            {
                "success": False,
                "error": "Error de validación",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )
