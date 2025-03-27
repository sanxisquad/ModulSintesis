from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import CustomUser, Role, Empresa
from .serializer import CustomUserSerializer, RoleSerializer, EmpresaSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status
from .permissions import IsSuperAdmin, IsAdminEmpresa, IsGestor, CombinedPermission  # Importa las clases de permisos
from rest_framework import permissions  # Importa permissions para usar permissions.IsAuthenticated()
from rest_framework.exceptions import PermissionDenied

# Vista de registro
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)  # Permite acceso sin autenticación
    serializer_class = CustomUserSerializer

# Aquí los viewsets para 'users' y 'roles'
from rest_framework import viewsets

class CustomUserViewSet(viewsets.ModelViewSet):
    serializer_class = CustomUserSerializer
    queryset = CustomUser.objects.none()
    
    def get_permissions(self):
        if self.action == 'list':
            return [permissions.IsAuthenticated()]
        elif self.action == 'destroy':
            return [CombinedPermission(IsSuperAdmin, IsAdminEmpresa)]
        elif self.action in ['create']:
            return [CombinedPermission(IsSuperAdmin, IsAdminEmpresa)]  # Modificado
        elif self.action in ['update', 'partial_update']:
            return [CombinedPermission(IsSuperAdmin, IsAdminEmpresa)]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user

        if not user.is_authenticated:
            return CustomUser.objects.none()

        if user.is_superadmin(): 
            return CustomUser.objects.all()

        if getattr(user, 'empresa', None):  
            return CustomUser.objects.filter(empresa=user.empresa)

        return CustomUser.objects.none()


    def perform_create(self, serializer):
        user = self.request.user
        if user.is_superadmin:
            serializer.save()
        elif user.is_admin:
            serializer.save(empresa=user.empresa)  # Asigna automáticamente su empresa
        else:
            raise PermissionDenied("No tienes permisos para crear usuarios")

    def perform_destroy(self, instance):
        user = self.request.user
        if user.is_admin and instance.empresa != user.empresa:
            raise PermissionDenied("Solo puedes eliminar usuarios de tu empresa")
        if not (user.is_superadmin or user.is_admin):
            raise PermissionDenied("No tienes permisos para esta acción")
        instance.delete()

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        if user.is_admin and instance.empresa != user.empresa:
            raise PermissionDenied("Solo puedes editar usuarios de tu empresa")
        if not (user.is_superadmin or user.is_admin):
            raise PermissionDenied("No tienes permisos para esta acción")
        serializer.save()

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    # Aquí también puedes agregar permisos si los necesitas

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        empresa_data = None
        if hasattr(user, 'empresa') and user.empresa:
            empresa_data = {
                'id': user.empresa.id,
                'nom': user.empresa.nom,
                'direccio': user.empresa.direccio,
                'email': user.empresa.email,
                'CP': user.empresa.CP
            }
        return Response({
            'username': user.username,
            'email': user.email,
            'is_gestor': user.is_gestor(),
            'is_admin': user.is_admin(),
            'CP': user.CP,
            'empresa': empresa_data,
            # Otros campos que quieras incluir
        })
    
class LogoutView(APIView):

    def post(self, request):
        try:
            print(f"❌ Request data: {request.data}")  # Verifica qué datos llegan
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            print(f"❌ Error: {str(e)}")  # Verifica si hay algún error
            return Response(status=status.HTTP_400_BAD_REQUEST)

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = Empresa.objects.all()
    serializer_class = EmpresaSerializer
    # Aquí también puedes agregar permisos si los necesitas