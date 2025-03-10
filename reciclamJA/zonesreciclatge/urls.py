from django.urls import path, include
from rest_framework import routers
from . import views  

app_name = 'zr'

# Crear el enrutador
router = routers.DefaultRouter()
router.register(r'zones', views.ZonesReciclatgeViewSet, basename='zones')
router.register(r'contenidors', views.ContenedorViewSet, basename='contenidors')

# Definir las URLs con el prefijo "api/v1/zr/"
urlpatterns = [
    path('api/v1/zr/', include(router.urls)),  # Esto ya incluye todas las rutas necesarias
    
]