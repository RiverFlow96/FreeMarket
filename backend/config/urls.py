"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from drf_spectacular.views import SpectacularSwaggerView, SpectacularAPIView

# Viewsets
from apps.users.views import UserViewSet
from apps.products.views import ProductViewSet
from apps.categories.views import CategoryViewSet
from apps.reports.views import ReportViewSet

# Import rest_framework library for make urls with routers function
from rest_framework import routers

# Import SimpleJWT libraries
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Start router from DefaultRouter
router = routers.DefaultRouter()

# Register routes for add routes to router
router.register(r"users", UserViewSet, "users")
router.register(r"products", ProductViewSet, "products")
# router.register(r"products-groups", ProductsGroupViewSet, "products-group")
router.register(r"categories", CategoryViewSet, "categories")
router.register(r"reports", ReportViewSet, "reports")

urlpatterns = [
    # Admin Panel Url
    path("admin/", admin.site.urls),
    # API Urls
    path("api/v1/", include(router.urls)),
    # API Docs
    path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/v1/doc/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    # JWT Urls
    path("api/v1/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/v1/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    # Serve media files regardless of DEBUG setting (for simple deployment like Render)
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
