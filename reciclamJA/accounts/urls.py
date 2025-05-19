from django.urls import path, include
from rest_framework import routers
from accounts import views
from .views import CheckEmailView  
from .password_reset import RequestPasswordResetView, VerifyTokenView, ResetPasswordView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

app_name = 'auth'

# Definir enrutador solo para autenticación
router = routers.DefaultRouter()
router.register(r'users', views.CustomUserViewSet, basename='users')  
router.register(r'roles', views.RoleViewSet, basename='roles')  # Roles
router.register(r'empreses', views.EmpresaViewSet, basename='empreses')  # Empresas

urlpatterns = [
    path("api/v1/", include(router.urls)),  # Incluir rutas de usuarios y roles

    # Autenticación con JWT
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/register/', views.RegisterView.as_view(), name='auth_register'),
    path('api/v1/auth/profile/', views.UserProfileView.as_view(), name='auth_profile'),
    path('api/v1/auth/logout/', views.LogoutView.as_view(), name='auth_logout'),  # Ruta de logout
    path('api/v1/empreses/', views.EmpresaViewSet.as_view({'get': 'list'}), name='empresas'),  # Ruta para empresas
    path('api/v1/auth/check-email/', CheckEmailView.as_view(), name='check_email'),

    # Rutas para restablecimiento de contraseña
    path('reset-password/request/', RequestPasswordResetView.as_view(), name='request-password-reset'),
    path('reset-password/verify/<str:uidb64>/<str:token>/', VerifyTokenView.as_view(), name='verify-token'),
    path('reset-password/reset/', ResetPasswordView.as_view(), name='reset-password'),
]