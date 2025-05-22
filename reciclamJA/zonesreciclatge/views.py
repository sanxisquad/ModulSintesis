from rest_framework.exceptions import PermissionDenied, NotFound as Http404
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Contenedor, ZonesReciclatge,ReporteContenedor, Notificacion, ComentarioReporte, HistorialContenedor
from .serializer import ContenedorSerializer, ZonesReciclatgeSerializer, ReporteContenedorSerializer, NotificacionSerializer, ComentarioReporteSerializer
from accounts.permissions import IsSuperAdmin, IsAdminEmpresa, IsGestor, CombinedPermission
from accounts.models import CustomUser
from django.db.models import Q, Count
from django.db.models.functions import TruncDate
from datetime import datetime, timedelta
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

        current_assigned = Contenedor.objects.filter(zona=zona)
        current_assigned.update(zona=None)
        
        contenedors = Contenedor.objects.filter(id__in=contenedor_ids)
        
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
        # Allow regular users to list and retrieve reports
        if self.action in ['create', 'list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        # Only admins/gestors can update, delete, etc.
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
        
        if reporte.usuario:
            Notificacion.objects.create(
                usuario=reporte.usuario,
                tipo='reporte',
                titulo=f"Reporte resuelto: {reporte.get_tipo_display()}",
                mensaje=f"Tu reporte #{reporte.id} ha sido marcado como resuelto",
                relacion_reporte=reporte
            )
            
        return Response({'status': 'Reporte resuelto correctamente'})

    @action(detail=True, methods=['post'])
    def rechazar(self, request, pk=None):
        reporte = self.get_object()
        comentario = request.data.get('comentario', '')
        
        reporte.estado = 'rechazado'
        reporte.comentario_cierre = comentario
        reporte.resuelto_por = request.user
        reporte.save()
        
        if reporte.usuario:
            # Crear notificación
            Notificacion.objects.create(
                usuario=reporte.usuario,
                tipo='reporte',
                titulo=f"Reporte rebutjat: {reporte.get_tipo_display()}",
                mensaje=f"El teu tiquet #{reporte.id} ha estat rebutjat.",
                relacion_reporte=reporte
            )
            
            # Incrementar contador de tickets rechazados
            usuario = reporte.usuario
            
            # Verificar si han pasado 6 meses desde el último ticket rechazado
            usuario.verificar_inactividad_tickets_rechazados()
            
            # Actualizar fecha del último ticket rechazado
            usuario.ultimo_ticket_rechazado = timezone.now()
            usuario.tickets_rechazados_acumulados += 1
            
            # Verificar si se debe aplicar la penalización (exactamente cuando llega a 5)
            if usuario.tickets_rechazados_acumulados >= 5:
                usuario.aplicar_penalizacion_tickets_rechazados()
            else:
                usuario.save()
        
        return Response({'status': 'Reporte rechazado correctamente'})

    @action(detail=True, methods=['post'])
    def procesar(self, request, pk=None):
        reporte = self.get_object()
        
        
        reporte.estado = 'en_proceso'
        reporte.save()
        
        return Response({'status': 'Reporte ahora en proceso'})

    @action(detail=True, methods=['post'])
    def reabrir(self, request, pk=None):
        reporte = self.get_object()
        reporte.estado = 'abierto'
        reporte.save()
        
        return Response({'status': 'Reporte reabierto correctamente'})

    def perform_update(self, serializer):
        instance = self.get_object()
        old_estado = instance.estado
        usuario = self.request.user
        
        # Guardamos la instancia actualizada
        updated_instance = serializer.save()
        new_estado = updated_instance.estado
        
        # Si el estado cambió de abierto/en_proceso a resuelto
        if old_estado in ['abierto', 'en_proceso'] and new_estado == 'resuelto':
            # Añadir puntos al usuario que creó el reporte (si existe)
            if updated_instance.usuario:
                reporter_user = updated_instance.usuario
                reporter_user.score += 50  # Añadir 100 puntos
                reporter_user.total_score += 50
                reporter_user.save()
                
                # Crear notificación para el usuario que reportó
                Notificacion.objects.create(
                    usuario=reporter_user,
                    tipo='reporte',
                    titulo=f"Reporte resolt: {updated_instance.get_tipo_display()}",
                    mensaje=f"El teu tiquet #{updated_instance.id} ha estat resolt. Has guanyat 100 punts!",
                    relacion_reporte=updated_instance
                )
        
        # Si el estado cambió a rechazado
        elif old_estado in ['abierto', 'en_proceso'] and new_estado == 'rechazado':
            # Notificar al usuario que su reporte fue rechazado
            if updated_instance.usuario:
                Notificacion.objects.create(
                    usuario=updated_instance.usuario,
                    tipo='reporte',
                    titulo=f"Reporte rebutjat: {updated_instance.get_tipo_display()}",
                    mensaje=f"El teu tiquet #{updated_instance.id} ha estat rebutjat.",
                    relacion_reporte=updated_instance
                )
                
                usuario_reporte = updated_instance.usuario
                
                usuario_reporte.verificar_inactividad_tickets_rechazados()
                
                usuario_reporte.ultimo_ticket_rechazado = timezone.now()
                usuario_reporte.tickets_rechazados_acumulados += 1
                
                if usuario_reporte.tickets_rechazados_acumulados >= 5:
                    usuario_reporte.aplicar_penalizacion_tickets_rechazados()
                else:
                    usuario_reporte.save()
        
        return updated_instance


class NotificacionViewSet(viewsets.ModelViewSet):
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Solo devuelve notificaciones del usuario actual
        return Notificacion.objects.filter(usuario=self.request.user).order_by('-fecha')
    
    @action(detail=False, methods=['post'])
    def marcar_como_leidas(self, request):
        # Marca todas las notificaciones del usuario como leídas
        Notificacion.objects.filter(usuario=request.user, leida=False).update(leida=True)
        return Response({"message": "Notificaciones marcadas como leídas"}, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['post'])
    def marcar_leida(self, request, pk=None):
        # Marca una notificación específica como leída
        notificacion = self.get_object()
        notificacion.leida = True
        notificacion.save()
        return Response({"message": "Notificación marcada como leída"}, status=status.HTTP_200_OK)


class ComentarioReporteViewSet(viewsets.ModelViewSet):
    serializer_class = ComentarioReporteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        reporte_id = self.kwargs.get('reporte_pk')
        print(f"Fetching comments for report: {reporte_id}")
        try:
            return ComentarioReporte.objects.filter(reporte_id=reporte_id)
        except Exception as e:
            print(f"Error getting comments: {str(e)}")
            return ComentarioReporte.objects.none()
    
    def perform_create(self, serializer):
        reporte_id = self.kwargs.get('reporte_pk')
        print(f"Creating comment for report: {reporte_id}")
        try:
            reporte = ReporteContenedor.objects.get(pk=reporte_id)
            
            # Check if user has permission to comment on this report
            user = self.request.user
            print(f"User attempting to comment: {user.username} (ID: {user.id})")
            
            if user.is_user() and reporte.usuario != user:
                print("Permission denied: user != ticket owner")
                raise PermissionDenied("No tienes permiso para comentar en este reporte")
                
            serializer.save(usuario=user, reporte=reporte)
            print(f"Comment created successfully by {user.username}")
            
            # If a manager/admin comments on an open ticket, change status to "en_proceso"
            if reporte.estado == 'abierto' and (user.is_admin() or user.is_gestor() or user.is_superadmin()):
                reporte.estado = 'en_proceso'
                reporte.save()
                print(f"Ticket status changed to 'en_proceso'")
                
        except ReporteContenedor.DoesNotExist:
            print(f"Report with ID {reporte_id} not found")
            raise Http404("Reporte no encontrado")
        except Exception as e:
            print(f"Unexpected error creating comment: {str(e)}")
            raise

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_historial_stats(request):
    """
    Retorna estadísticas históricas para gráficos de tendencias
    """
    user = request.user
    
    # Verificar permisos - solo gestores/admin/superadmin
    if not (user.is_gestor() or user.is_admin() or user.is_superadmin()):
        return Response({"error": "No tens permisos per accedir a aquestes dades"}, status=403)
    
    # Obtener parámetros de periodo y zona
    period = request.query_params.get('period', 'month')
    zona_id = request.query_params.get('zona_id', None)
    
    # Definir el período de tiempo a consultar
    now = timezone.now()
    if period == 'week':
        start_date = now - timedelta(days=7)
        # Días de la semana en catalán (abreviados)
        dias_semana_cat = ['Dl', 'Dt', 'Dc', 'Dj', 'Dv', 'Ds', 'Dg']
        date_format = lambda d: dias_semana_cat[d.weekday()]
    elif period == 'month':
        start_date = now - timedelta(days=30)
        date_format = lambda d: f"{d.day:02d}/{d.month:02d}"
    elif period == 'quarter':
        start_date = now - timedelta(days=90)
        date_format = lambda d: f"{d.day:02d}/{d.month:02d}"
    elif period == 'year':
        start_date = now - timedelta(days=365)
        date_format = lambda d: f"{d.month:02d}/{d.year}"
    else:
        start_date = now - timedelta(days=30)
        date_format = lambda d: f"{d.day:02d}/{d.month:02d}"
    
    # Filtrar historial por empresa y/o zona si es necesario
    contenedores_query = Contenedor.objects.all()
    if not user.is_superadmin() and user.empresa:
        contenedores_query = contenedores_query.filter(empresa=user.empresa)
    
    # Filtrar por zona si se proporciona el parámetro
    if zona_id and zona_id != 'all':
        try:
            zona_id = int(zona_id)
            contenedores_query = contenedores_query.filter(zona_id=zona_id)
        except (ValueError, TypeError):
            pass  # Si el ID de zona no es válido, ignoramos el filtro
    
    # Generar puntos de datos para el período seleccionado
    result = []
    
    # Generar datos diarios en el rango especificado
    current_date = start_date.date()
    end_date = now.date() + timedelta(days=1)  # Incluir el día actual
    
    while current_date < end_date:
        next_date = current_date + timedelta(days=1)
        
        # Calcular el estado de los contenedores para este día
        # Primero, buscar registros de HistorialContenedor de ese día
        historial_dia = HistorialContenedor.objects.filter(
            fecha__date=current_date,
            contenedor__in=contenedores_query
        ).order_by('contenedor_id', '-fecha')  # Ordenar para tener el último estado de cada contenedor
        
        # Identificar los contenedores únicos que tienen historial este día
        contenedores_con_historial = set()
        estados_por_contenedor = {}
        
        for registro in historial_dia:
            if registro.contenedor_id not in contenedores_con_historial:
                contenedores_con_historial.add(registro.contenedor_id)
                estados_por_contenedor[registro.contenedor_id] = registro.estado_actual
        
        # Para contenedores sin historial en este día, buscar su estado más reciente anterior a este día
        for contenedor in contenedores_query:
            if contenedor.id not in contenedores_con_historial:
                historial_anterior = HistorialContenedor.objects.filter(
                    contenedor=contenedor,
                    fecha__date__lt=current_date
                ).order_by('-fecha').first()
                
                if historial_anterior:
                    estados_por_contenedor[contenedor.id] = historial_anterior.estado_actual
                else:
                    # Si no hay historial, usar el estado actual del contenedor
                    estados_por_contenedor[contenedor.id] = contenedor.estat
        
        # Contar contenedores por estado
        vacios = sum(1 for estado in estados_por_contenedor.values() if estado == 'buit')
        medio_llenos = sum(1 for estado in estados_por_contenedor.values() if estado == 'mig')
        llenos = sum(1 for estado in estados_por_contenedor.values() if estado == 'ple')
        
        # Agregar punto de datos para este día
        result.append({
            'name': date_format(current_date),
            'fecha': current_date.strftime('%Y-%m-%d'),
            'buits': vacios,
            'mig_plens': medio_llenos,
            'plens': llenos,
            'total': vacios + medio_llenos + llenos
        })
        
        current_date = next_date
    
    return Response(result)