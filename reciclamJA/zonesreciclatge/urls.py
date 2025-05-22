from django.urls import path, include
from rest_framework import routers
from . import views  
from .views import (
    ContenedorViewSet, ZonesReciclatgeViewSet,
    PublicContenedorViewSet, PublicZonesViewSet,
    ReporteContenedorViewSet, NotificacionViewSet,
    ComentarioReporteViewSet  # Add this import
)

app_name = 'zr'

router = routers.DefaultRouter()
router.register(r'contenidors', ContenedorViewSet, basename='contenidors')
router.register(r'zones', ZonesReciclatgeViewSet, basename='zones')
router.register(r'reportes', ReporteContenedorViewSet, basename='reportes')
router.register(r'notificaciones', NotificacionViewSet, basename='notificaciones')
router.register(r'public/contenidors', PublicContenedorViewSet, basename='public-contenidors')
router.register(r'public/zones', PublicZonesViewSet, basename='public-zones')

# Add the nested route for comments
urlpatterns = [
    path('', include(router.urls)),
    # Actions específicas para reportes
    path('reportes/<int:pk>/resolver/', views.ReporteContenedorViewSet.as_view({'post': 'resolver'}), name='reporte-resolver'),
    path('reportes/<int:pk>/rechazar/', views.ReporteContenedorViewSet.as_view({'post': 'rechazar'}), name='reporte-rechazar'),
    path('reportes/<int:pk>/procesar/', views.ReporteContenedorViewSet.as_view({'post': 'procesar'}), name='reporte-procesar'),
    path('reportes/<int:reporte_pk>/comentarios/', ComentarioReporteViewSet.as_view({'get': 'list', 'post': 'create'}), name='reporte-comentarios'),
    path('reportes/<int:reporte_pk>/comentarios/<int:pk>/', ComentarioReporteViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='reporte-comentario-detail'),
    path('historial-stats/', views.get_historial_stats, name='historial_stats'),
]