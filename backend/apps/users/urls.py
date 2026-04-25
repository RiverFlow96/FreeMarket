from django.urls import path, include

from rest_framework import routers
from .views import UserViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet, basename="users")

urlpatterns = [
    path("users/", include(router.urls))
]