from rest_framework.routers import DefaultRouter
from .views import PartidaViewSet

router = DefaultRouter()
router.register(r'historico', PartidaViewSet, basename='historico')

urlpatterns = router.urls
