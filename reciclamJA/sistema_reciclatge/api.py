from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Prize, PrizeRedemption
from .serializers import PrizeSerializer, PrizeRedemptionSerializer

# Crear un permiso personalizado para gestores y admins
class IsGestorAdminOrSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        # Verificar si el usuario está autenticado y tiene uno de los roles necesarios
        return (
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_gestor() or request.user.is_admin() or request.user.is_superadmin())
        )

class PrizeViewSet(viewsets.ModelViewSet):
    queryset = Prize.objects.filter(activo=True)
    serializer_class = PrizeSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'redeem']:
            # Todos los usuarios autenticados pueden ver y canjear premios
            return [permissions.IsAuthenticated()]
        # Solo gestores, admins y superadmins pueden crear, actualizar, eliminar
        return [permissions.IsAuthenticated(), IsGestorAdminOrSuperAdmin()]
    
    def get_queryset(self):
        queryset = Prize.objects.all()  # Mostrar todos los premios a los gestores/admins
        
        # Para usuarios normales, filtrar por activo y cantidad
        if not (self.request.user.is_gestor() or self.request.user.is_admin() or self.request.user.is_superadmin()):
            queryset = queryset.filter(activo=True, cantidad__gt=0)
            
        return queryset
    
    def perform_create(self, serializer):
        # Set the creado_por field to the current user
        user = self.request.user
        
        # If empresa is not explicitly set and user has an empresa, set it automatically
        if 'empresa' not in serializer.validated_data and user.empresa:
            serializer.save(creado_por=user, empresa=user.empresa)
        else:
            serializer.save(creado_por=user)
    
    def perform_update(self, serializer):
        # For updates, only allow changing empresa if the user is admin/superadmin
        user = self.request.user
        if not (user.is_admin() or user.is_superadmin()):
            # Regular users and gestors can only set their own empresa
            if 'empresa' in serializer.validated_data and serializer.validated_data['empresa'] != user.empresa:
                serializer.validated_data['empresa'] = user.empresa
        
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def redeem(self, request, pk=None):
        prize = self.get_object()
        user = request.user
        
        # Check if the prize is available
        if not prize.is_available:
            return Response(
                {"error": "Aquest premi no està disponible actualment"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has enough points
        if user.score < prize.puntos_costo:
            return Response(
                {"error": f"No tens prou punts. Necessites {prize.puntos_costo} punts."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create redemption
        redemption = PrizeRedemption.objects.create(
            usuario=user,
            premio=prize,
            puntos_gastados=prize.puntos_costo
        )
        
        return Response(
            PrizeRedemptionSerializer(redemption).data,
            status=status.HTTP_201_CREATED
        )

class PrizeRedemptionViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PrizeRedemptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # If admin/gestor/superadmin, show all if requested
        if user.is_gestor() or user.is_admin() or user.is_superadmin():
            # For company managers, filter by their company's prizes
            if 'all' in self.request.query_params and (user.is_admin() or user.is_superadmin()):
                return PrizeRedemption.objects.all()
            if user.empresa:
                return PrizeRedemption.objects.filter(premio__empresa=user.empresa)
        
        # Regular users only see their own redemptions
        return PrizeRedemption.objects.filter(usuario=user)