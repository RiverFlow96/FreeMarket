from rest_framework import routers
from .views import ReportViewSet

router = routers.DefaultRouter()
router.register(r"reports", ReportViewSet, "reports")

urlpatterns = router.urls
