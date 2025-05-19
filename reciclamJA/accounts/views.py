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
from .services import enviar_correo_credenciales  # Importa la función para enviar correo

# Vista de registro
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)  # Permite acceso sin autenticación
    serializer_class = CustomUserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        
        # Enviar correo con credenciales (si tienes el password en texto plano)
        enviar_correo_credenciales(
            nombre=user.first_name,
            email=user.email,
            password=serializer.validated_data['password'],  # Asegúrate de tener esto disponible
            apellidos=user.last_name
        )

        return user

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
            'is_superadmin': user.is_superadmin(),
            'is_user': user.is_user(),
            'CP': user.CP,
            'empresa': empresa_data,
            'score': user.score,
            'location': user.location,
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
class CheckEmailView(APIView):
    """
    Vista para verificar si un correo electrónico ya existe en el sistema.
    """
    permission_classes = [AllowAny]  # Permite el acceso sin autenticación
    
    def post(self, request):
        email = request.data.get('email', None)
        
        if email is None:
            return Response({'error': 'Email es requerido'}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar si el correo electrónico existe en la base de datos
        if CustomUser.objects.filter(email=email).exists():
            return Response({'exists': True}, status=status.HTTP_200_OK)
        return Response({'exists': False}, status=status.HTTP_200_OK)