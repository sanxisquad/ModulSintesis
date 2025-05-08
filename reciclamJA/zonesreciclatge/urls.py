from django.urls import path, include
from rest_framework import routers
from . import views  
from .views import (
    ContenedorViewSet, ZonesReciclatgeViewSet,
    PublicContenedorViewSet, PublicZonesViewSet,
    ReporteContenedorViewSet, NotificacionViewSet
)

app_name = 'zr'

router = routers.DefaultRouter()
router.register(r'contenidors', ContenedorViewSet, basename='contenidors')
router.register(r'zones', ZonesReciclatgeViewSet, basename='zones')
router.register(r'reportes', ReporteContenedorViewSet, basename='reportes')
router.register(r'notificaciones', NotificacionViewSet, basename='notificaciones')
router.register(r'public/contenidors', PublicContenedorViewSet, basename='public-contenidors')
router.register(r'public/zones', PublicZonesViewSet, basename='public-zones')

urlpatterns = [
    path('', include(router.urls)),
]