from rest_framework.exceptions import PermissionDenied
from rest_framework import viewsets, permissions  # Añadido permissions aquí
from .models import Contenedor, ZonesReciclatge
from .serializer import ContenedorSerializer, ZonesReciclatgeSerializer
from accounts.permissions import IsSuperAdmin, IsAdminEmpresa, IsGestor, CombinedPermission

class ContenedorViewSet(viewsets.ModelViewSet):
    serializer_class = ContenedorSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [CombinedPermission(IsSuperAdmin, IsAdminEmpresa, IsGestor)]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user

        if user.is_superadmin(): 
            return Contenedor.objects.all()

        if getattr(user, 'empresa', None):
            return Contenedor.objects.filter(empresa=user.empresa)

        return Contenedor.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_superadmin() or user.is_admin() or user.is_gestor():
            if not user.is_superadmin():
                serializer.save(empresa=user.empresa)
            else:
                serializer.save()
        else:
            raise PermissionDenied("No tienes permisos para crear este recurso.")

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        
        if user.is_superadmin():
            serializer.save()
        elif user.is_admin() or user.is_gestor():
            if instance.empresa == user.empresa:
                serializer.save()
            else:
                raise PermissionDenied("No tienes permisos para modificar este recurso.")
        else:
            raise PermissionDenied("No tienes permisos para modificar este recurso.")

    def perform_destroy(self, instance):
        user = self.request.user
        if user.is_superadmin():
            instance.delete()
        elif user.is_admin() or user.is_gestor():
            if instance.empresa == user.empresa:
                instance.delete()
            else:
                raise PermissionDenied("No tienes permisos para eliminar este recurso.")
        else:
            raise PermissionDenied("No tienes permisos para eliminar este recurso.")


class ZonesReciclatgeViewSet(viewsets.ModelViewSet):
    serializer_class = ZonesReciclatgeSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [CombinedPermission(IsSuperAdmin, IsAdminEmpresa, IsGestor)]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user

        if user.is_superadmin(): 
            return ZonesReciclatge.objects.all()

        if getattr(user, 'empresa', None):
            return ZonesReciclatge.objects.filter(empresa=user.empresa)

        return ZonesReciclatge.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.is_superadmin() or user.is_admin() or user.is_gestor():
            if not user.is_superadmin():
                serializer.save(empresa=user.empresa)
            else:
                serializer.save()
        else:
            raise PermissionDenied("No tienes permisos para crear este recurso.")

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        
        if user.is_superadmin():
            serializer.save()
        elif user.is_admin() or user.is_gestor():
            if instance.empresa == user.empresa:
                serializer.save()
            else:
                raise PermissionDenied("No tienes permisos para modificar este recurso.")
        else:
            raise PermissionDenied("No tienes permisos para modificar este recurso.")

    def perform_destroy(self, instance):
        user = self.request.user
        if user.is_superadmin():
            instance.delete()
        elif user.is_admin() or user.is_gestor():
            if instance.empresa == user.empresa:
                instance.delete()
            else:
                raise PermissionDenied("No tienes permisos para eliminar este recurso.")
        else:
            raise PermissionDenied("No tienes permisos para eliminar este recurso.")