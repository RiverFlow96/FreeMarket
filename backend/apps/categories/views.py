from .models import Category
from .serializers import CategorySerializer
from rest_framework import viewsets


class CategoryViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """

    serializer_class = CategorySerializer
    queryset = Category.objects.all()
