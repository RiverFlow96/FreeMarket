from rest_framework import routers
from .views import ProductViewSet, ProductsGroupViewSet

router = routers.DefaultRouter()
router.register(r"products", ProductViewSet, basename="products")
router.register(r"products-group", ProductsGroupViewSet, basename="products-group")

urlpatterns = router.urls
