from django.urls import path, include
from rest_framework import routers
from . import views  # Importa las vistas que creaste
app_name = 'zr'
# Crear el enrutador
router = routers.DefaultRouter()

# Registrar los ViewSets en el enrutador
router.register(r'zones', views.ZonesReciclatgeViewSet, basename='zones')
router.register(r'contenidors', views.ContenedorViewSet, basename='contenidors')

# Definir las URLs con el prefijo "api/v1/zr/"
urlpatterns = [
    path('api/v1/zr/', include(router.urls)),  # Aquí se agrega el prefijo "zr"
    path('api/v1/zr/contenidors/', views.ContenedorViewSet.as_view(), name='totsContenidors'),
]
