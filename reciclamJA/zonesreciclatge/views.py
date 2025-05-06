from rest_framework.exceptions import PermissionDenied
from rest_framework import viewsets, permissions  # Añadido permissions aquí
from .models import Contenedor, ZonesReciclatge,ReporteContenedor, Notificacion
from .serializer import ContenedorSerializer, ZonesReciclatgeSerializer, ReporteContenedorSerializer
from accounts.permissions import IsSuperAdmin, IsAdminEmpresa, IsGestor, CombinedPermission
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.models import CustomUser
from django.db.models import Q
from django.utils import timezone
from django.db import models

class ContenedorViewSet(viewsets.ModelViewSet):
    serializer_class = ContenedorSerializer

    def get_permissions(self):
        return [CombinedPermission(IsSuperAdmin, IsAdminEmpresa, IsGestor)]

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            raise PermissionDenied("Debes estar autenticado para ver los contenedores.")

        if user.is_superadmin():
            return Contenedor.objects.all()

        if user.is_user():
            return Contenedor.objects.none()

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
        return [CombinedPermission(IsSuperAdmin, IsAdminEmpresa, IsGestor)]

    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            raise PermissionDenied("Debes estar autenticado para ver las zonas.")

        if user.is_superadmin():
            return ZonesReciclatge.objects.all()

        if user.is_user():
            return ZonesReciclatge.objects.none()

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
            
    @action(detail=True, methods=['post'], url_path='assign-contenedors')
    def assign_contenedors(self, request, pk=None):
        zona = self.get_object()
        contenedor_ids = request.data.get('contenedor_ids', [])
        
        # Verificar permisos
        if not (request.user.is_superadmin() or 
            (request.user.is_admin() and zona.empresa == request.user.empresa) or
            (request.user.is_gestor() and zona.empresa == request.user.empresa)):
            raise PermissionDenied("No tienes permisos para realizar esta acción")

        # Obtener todos los contenedores actualmente asignados a esta zona
        current_assigned = Contenedor.objects.filter(zona=zona)
        
        # 1. Primero desasignar TODOS los contenedores de esta zona
        current_assigned.update(zona=None)
        
        # 2. Luego asignar solo los nuevos contenedores seleccionados
        contenedors = Contenedor.objects.filter(id__in=contenedor_ids)
        
        # Verificar que todos los contenedores pertenecen a la misma empresa (si no es superadmin)
        if not request.user.is_superadmin():
            for c in contenedors:
                if c.empresa != request.user.empresa:
                    return Response(
                        {'status': 'Error', 'message': f'El contenedor {c.id} no pertenece a tu empresa'}, 
                        status=400
                    )
        
        # Actualizar los contenedores
        contenedores_asignados = []
        for c in contenedors:
            c.zona = zona
            c.save()
            contenedores_asignados.append(c.id)

        return Response({
            'status': 'Contenedores asignados correctamente', 
            'contenedores': contenedores_asignados,
            'total_asignados': len(contenedores_asignados)
        })
    # --- Vistas públicas de solo lectura ---

class PublicContenedorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Contenedor.objects.all()
    serializer_class = ContenedorSerializer
    permission_classes = [permissions.AllowAny]


class PublicZonesViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ZonesReciclatge.objects.all()
    serializer_class = ZonesReciclatgeSerializer
    permission_classes = [permissions.AllowAny]
class ReporteContenedorViewSet(viewsets.ModelViewSet):
    serializer_class = ReporteContenedorSerializer
    queryset = ReporteContenedor.objects.all()

    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated()]
        return [CombinedPermission(IsSuperAdmin, IsAdminEmpresa, IsGestor)]

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(usuario=user)

    def get_queryset(self):
        user = self.request.user
        
        if not user.is_authenticated:
            return ReporteContenedor.objects.none()
            
        if user.is_superadmin():
            return ReporteContenedor.objects.all()
            
        if user.is_user():
            return ReporteContenedor.objects.filter(usuario=user)
            
        if getattr(user, 'empresa', None):
            # Para gestores y admin: ver reportes de su empresa
            return ReporteContenedor.objects.filter(
                models.Q(contenedor__empresa=user.empresa) | 
                models.Q(zona__empresa=user.empresa)
            )

                
        return ReporteContenedor.objects.none()

    @action(detail=True, methods=['post'])
    def asignar(self, request, pk=None):
        reporte = self.get_object()
        gestor_id = request.data.get('gestor_id')
        
        if not gestor_id:
            return Response({'error': 'Se requiere gestor_id'}, status=400)
            
        try:
            gestor = CustomUser.objects.get(pk=gestor_id)
            if not (gestor.is_gestor() or gestor.is_admin()):
                return Response({'error': 'El usuario no es gestor o admin'}, status=400)
                
            reporte.gestor_asignado = gestor
            reporte.estado = 'en_proceso'
            reporte.save()
            
            # Crear notificación
            Notificacion.objects.create(
                usuario=gestor,
                tipo='reporte',
                titulo=f"Reporte asignado: {reporte.get_tipo_display()}",
                mensaje=f"Se te ha asignado el reporte #{reporte.id}",
                relacion_reporte=reporte
            )
            
            return Response({'status': 'Reporte asignado correctamente'})
            
        except CustomUser.DoesNotExist:
            return Response({'error': 'Gestor no encontrado'}, status=404)

    @action(detail=True, methods=['post'])
    def resolver(self, request, pk=None):
        reporte = self.get_object()
        comentario = request.data.get('comentario', '')
        
        reporte.estado = 'resuelto'
        reporte.comentario_cierre = comentario
        reporte.resuelto_por = request.user
        reporte.save()
        
        # Notificar al usuario que reportó
        if reporte.usuario:
            Notificacion.objects.create(
                usuario=reporte.usuario,
                tipo='reporte',
                titulo=f"Reporte resuelto: {reporte.get_tipo_display()}",
                mensaje=f"Tu reporte #{reporte.id} ha sido marcado como resuelto",
                relacion_reporte=reporte
            )
            
        return Response({'status': 'Reporte resuelto correctamente'})