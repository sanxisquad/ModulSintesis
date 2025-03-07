from rest_framework import viewsets
from .models import ZonesReciclatge, Contenedor
from .serializer import ZonesReciclatgeSerializer, ContenedorSerializer
from rest_framework.permissions import IsAuthenticated

# Vista para la gestión de ZonesReciclatge
class ZonesReciclatgeViewSet(viewsets.ModelViewSet):
    queryset = ZonesReciclatge.objects.all()
    serializer_class = ZonesReciclatgeSerializer

# Vista para la gestión de Contenedores
class ContenedorViewSet(viewsets.ModelViewSet):
    queryset = Contenedor.objects.all()
    serializer_class = ContenedorSerializer
