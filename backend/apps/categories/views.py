from .models import Category
from .serializers import CategorySerializer
from rest_framework import viewsets
from rest_framework.response import Response


class CategoryViewSet(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    queryset = Category.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Paginación
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 100))
        page_size = min(page_size, 100)

        total = queryset.count()
        pages = (total + page_size - 1) // page_size if total > 0 else 0
        offset = (page - 1) * page_size
        categories = queryset[offset : offset + page_size]

        serializer = self.get_serializer(categories, many=True)

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
