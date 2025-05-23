from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import CustomUser, Role
from .serializer import CustomUserSerializer, RoleSerializer
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

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
    # Aquí puedes agregar permisos si los necesitas

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    # Aquí también puedes agregar permisos si los necesitas