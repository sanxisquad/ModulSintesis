from rest_framework.exceptions import PermissionDenied
from rest_framework import viewsets
from .models import Contenedor, ZonesReciclatge
from .serializer import ContenedorSerializer, ZonesReciclatgeSerializer
from .permissions import IsEmpresaMember  
from accounts.models import CustomUser  # Importamos el modelo de usuario si es necesario

class ContenedorViewSet(viewsets.ModelViewSet):
    serializer_class = ContenedorSerializer
    permission_classes = [IsEmpresaMember]

    def get_queryset(self):
        """Los gestores ven solo los contenedores de su empresa. Los usuarios normales ven todos."""
        user = self.request.user
        if user.is_staff or not user.is_gestor():  # Admins y usuarios normales ven todo
            return Contenedor.objects.all()
        return Contenedor.objects.filter(empresa=user.empresa)  # Gestores solo ven los suyos

    def perform_create(self, serializer):
        """Solo gestores pueden crear, y solo dentro de su empresa."""
        if self.request.user.is_gestor():  
            serializer.save(empresa=self.request.user.empresa)
        else:
            raise PermissionDenied("No tienes permisos para crear contenedores.")

    def perform_update(self, serializer):
        """Solo gestores pueden modificar sus contenedores. Usuarios normales no pueden editar."""
        instance = self.get_object()
        if not self.request.user.is_gestor() or instance.empresa != self.request.user.empresa:
            raise PermissionDenied("No tienes permisos para modificar este contenedor.")
        serializer.save()

    def perform_destroy(self, instance):
        """Solo gestores pueden eliminar sus contenedores. Usuarios normales no pueden borrar."""
        if not self.request.user.is_gestor() or instance.empresa != self.request.user.empresa:
            raise PermissionDenied("No tienes permisos para eliminar este contenedor.")
        instance.delete()

class ZonesReciclatgeViewSet(viewsets.ModelViewSet):
    serializer_class = ZonesReciclatgeSerializer
    permission_classes = [IsEmpresaMember]

    def get_queryset(self):
        """Los gestores ven solo las zonas de su empresa. Los usuarios normales ven todas."""
        user = self.request.user
        if user.is_staff or not user.is_gestor():  # Admins y usuarios normales ven todo
            return ZonesReciclatge.objects.all()
        return ZonesReciclatge.objects.filter(empresa=user.empresa)  # Gestores solo ven las suyas

    def perform_create(self, serializer):
        """Solo gestores pueden crear, y solo dentro de su empresa."""
        if self.request.user.is_gestor():  
            serializer.save(empresa=self.request.user.empresa)
        else:
            raise PermissionDenied("No tienes permisos para crear zonas de reciclaje.")

    def perform_update(self, serializer):
        """Solo gestores pueden modificar sus zonas. Usuarios normales no pueden editar."""
        instance = self.get_object()
        if not self.request.user.is_gestor() or instance.empresa != self.request.user.empresa:
            raise PermissionDenied("No tienes permisos para modificar esta zona.")
        serializer.save()

    def perform_destroy(self, instance):
        """Solo gestores pueden eliminar sus zonas. Usuarios normales no pueden borrar."""
        if not self.request.user.is_gestor() or instance.empresa != self.request.user.empresa:
            raise PermissionDenied("No tienes permisos para eliminar esta zona.")
        instance.delete()
