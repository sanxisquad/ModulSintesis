from django.urls import path
from . import views

app_name = 'sistema_reciclatge'

urlpatterns = [
    # Ruta existente modificada para mayor compatibilidad
    path('escanejar/', views.escanear_codigo, name='escanear_codigo'),
    path('historial/', views.historial_reciclaje, name='historial_reciclaje'),
    
    # Nuevos endpoints para bolsas virtuales
    path('bolsas/', views.mis_bolsas, name='mis_bolsas'),
    path('bolsas/crear/', views.crear_bolsa, name='crear_bolsa'),
    path('bolsas/<int:pk>/', views.detalles_bolsa, name='detalles_bolsa'),
    path('bolsas/<int:pk>/reciclar/', views.reciclar_bolsa, name='reciclar_bolsa'),
    path('productos/<int:producto_id>/agregar-a-bolsa/', views.agregar_a_bolsa, name='agregar_a_bolsa'),
]
