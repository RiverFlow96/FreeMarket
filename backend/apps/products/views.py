from .models import Product, ProductsGroup
from .serializers import ProductSerializer, ProductsGroupSerializer
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated


# Create your views here.
class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()


class ProductsGroupViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = ProductsGroupSerializer

    def get_queryset(self):
        return ProductsGroup.objects.filter(owner=self.request.user.profile)
