from .models import Product
from .serializers import ProductSerializer
from .permissions import IsAdminOrOwner
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOwner]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Product.objects.all()
        return Product.objects.filter(seller=self.request.user)
