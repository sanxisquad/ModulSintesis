from rest_framework import viewsets, permissions
from .models import Contenedor, ZonesReciclatge
from .serializer import ContenedorSerializer, ZonesReciclatgeSerializer
from .permissions import IsEmpresaMember  

class ContenedorViewSet(viewsets.ModelViewSet):
    queryset = Contenedor.objects.all()
    serializer_class = ContenedorSerializer
    permission_classes = [IsEmpresaMember]  # Aplicamos la restricción de acceso

class ZonesReciclatgeViewSet(viewsets.ModelViewSet):
    queryset = ZonesReciclatge.objects.all()
    serializer_class = ZonesReciclatgeSerializer
    permission_classes = [IsEmpresaMember]  # Aplicamos la restricción de acceso
