from django.urls import path
from . import views

app_name = 'sistema_reciclatge'

urlpatterns = [
    # Ruta existente modificada para mayor compatibilidad
    path('escanejar/', views.escanear_codigo, name='escanear_codigo'),
    path('historial/', views.historial_reciclaje, name='historial_reciclaje'),
    
    # Ruta de prueba para depuración
    path('test/', views.test_view, name='test_view'),
]
