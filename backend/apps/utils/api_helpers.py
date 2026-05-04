"""API helpers: pagination mixins and standardized responses."""

from rest_framework.response import Response
from rest_framework import status


def paginate_queryset(
    queryset,
    request,
    page_size_param="page_size",
    default_page_size=20,
    max_page_size=100,
):
    """Generic pagination for DRF viewSets.

    Returns a standardized paginated response with:
    - items: list of serialized objects
    - total: total count of objects
    - page: current page number
    - page_size: items per page
    - pages: total pages

    Supports query params: ?page=1&page_size=20&search=term
    """
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get(page_size_param, default_page_size))

    # Clamp page_size to max
    page_size = min(page_size, max_page_size)

    # Get search param if exists
    search = request.query_params.get("search", None)

    # Apply search filter if model supports it
    if search and hasattr(queryset, "filter"):
        # Try common search patterns - this is generic
        queryset = queryset.filter(name__icontains=search)

    total = queryset.count()
    pages = (total + page_size - 1) // page_size if total > 0 else 0

    offset = (page - 1) * page_size
    items = queryset[offset : offset + page_size]

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": pages,
    }


def success_response(data=None, message=None, status_code=status.HTTP_200_OK):
    """Standardized success response."""
    response = {"success": True}
    if message:
        response["message"] = message
    if data is not None:
        response["data"] = data
    return Response(response, status=status_code)


def error_response(message, errors=None, status_code=status.HTTP_400_BAD_REQUEST):
    """Standardized error response."""
    response = {
        "success": False,
        "error": message,
    }
    if errors:
        response["errors"] = errors
    return Response(response, status=status_code)


def created_response(data, message="Recurso creado exitosamente"):
    """Standardized 201 response."""
    return success_response(
        data=data, message=message, status_code=status.HTTP_201_CREATED
    )


def not_found_response(message="Recurso no encontrado"):
    """Standardized 404 response."""
    return error_response(message, status_code=status.HTTP_404_NOT_FOUND)


def forbidden_response(message="No tienes permiso para realizar esta acción"):
    """Standardized 403 response."""
    return error_response(message, status_code=status.HTTP_403_FORBIDDEN)


def validation_error_response(errors):
    """Standardized 422 validation error response."""
    return error_response(
        "Error de validación",
        errors=errors,
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
    )
