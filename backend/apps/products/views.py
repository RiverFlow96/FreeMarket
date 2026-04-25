from .models import Product, ProductsGroup
from .serializers import ProductSerializer, ProductsGroupSerializer
from rest_framework import viewsets


# Create your views here.
class ProductViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    serializer_class = ProductSerializer
    queryset = Product.objects.all()


class ProductsGroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    serializer_class = ProductsGroupSerializer
    queryset = ProductsGroup.objects.all()
