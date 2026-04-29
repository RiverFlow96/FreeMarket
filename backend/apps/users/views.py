from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import permissions

from apps.products.models import Product
from apps.products.serializers import ProductSerializer

from .models import User
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

    @action(
        detail=False,
        methods=["get", "put", "patch"],
    )
    def profile(self, request):
        user = request.user
        if request.method == "GET":
            serializer = UserProfileSerializer(user)
            return Response(serializer.data)

        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            if "email" in request.data:
                user.email = request.data["email"]
            if "phone" in request.data:
                user.phone = request.data["phone"]
            if "address" in request.data:
                user.address = request.data["address"]
            user.save()
            return Response(UserProfileSerializer(user).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"])
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data["old_password"]
            new_password = serializer.validated_data["new_password"]

            if not user.check_password(old_password):
                return Response(
                    {"old_password": ["La contrasena actual es incorrecta."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user.set_password(new_password)
            user.save()
            return Response({"message": "Contrasena cambiada exitosamente."})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"])
    def my_products(self, request):
        products = Product.objects.filter(seller=request.user)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def all_products(self, request):
        if not request.user.is_staff:
            return Response(
                {"error": "No tienes permiso para ver todos los productos."},
                status=status.HTTP_403_FORBIDDEN,
            )
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def update_plan(self, request):
        serializer = UpdatePlanSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            user.plan = serializer.validated_data["plan"]
            user.save()
            return Response(
                {
                    "message": "Plan actualizado exitosamente.",
                    "plan": user.plan,
                    "product_limit": user.product_limit,
                }
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
