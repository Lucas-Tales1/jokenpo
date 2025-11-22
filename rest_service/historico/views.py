from rest_framework import viewsets
from .models import Partida
from .serializers import PartidaSerializer

class PartidaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Partida.objects.all().order_by('-data')
    serializer_class = PartidaSerializer
