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

# Vista de registro
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = (AllowAny,)  # Permite acceso sin autenticación
    serializer_class = CustomUserSerializer

# Aquí los viewsets para 'users' y 'roles'
from rest_framework import viewsets

class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]  # Solo usuarios autenticados pueden acceder

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