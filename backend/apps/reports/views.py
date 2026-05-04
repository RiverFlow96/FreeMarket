from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import Report
from .serializers import ReportSerializer


class ReportViewSet(viewsets.ModelViewSet):
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            if self.request.user.is_staff:
                return [IsAdminUser()]
            return [IsAuthenticated()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Report.objects.select_related("reporter", "product").all()
        return Report.objects.filter(reporter=self.request.user).select_related(
            "product"
        )

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()

        # Paginación
        page = int(request.query_params.get("page", 1))
        page_size = int(request.query_params.get("page_size", 20))
        page_size = min(page_size, 100)

        total = queryset.count()
        pages = (total + page_size - 1) // page_size if total > 0 else 0
        offset = (page - 1) * page_size
        reports = queryset[offset : offset + page_size]

        serializer = self.get_serializer(reports, many=True)

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
