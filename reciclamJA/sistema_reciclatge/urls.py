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
    
    # Rutas para premios
    path('premios/', views.lista_premios, name='lista_premios'),
    path('premios/<int:pk>/', views.detalle_premio, name='detalle_premio'),
    path('premios/crear/', views.crear_premio, name='crear_premio'),
    path('premios/<int:pk>/actualizar/', views.actualizar_premio, name='actualizar_premio'),
    path('premios/<int:pk>/eliminar/', views.eliminar_premio, name='eliminar_premio'),
    path('premios/<int:pk>/redeem/', views.canjear_premio, name='canjear_premio'),
    
    # Rutas para redenciones de premios
    path('premios-redenciones/', views.lista_redenciones, name='lista_redenciones'),
    path('premios-redenciones/<int:pk>/', views.detalle_redencion, name='detalle_redencion'),
    path('premios-redenciones/<int:pk>/actualizar-estado/', views.actualizar_estado_redencion, name='actualizar_estado_redencion'),

    # Statistics endpoints
    path('api/stats/top-recyclers/', views.estadisticas_top_recyclers, name='top-recyclers'),
    path('api/stats/top-reporters/', views.estadisticas_top_reporters, name='top-reporters'),
    path('api/stats/top-containers/', views.estadisticas_top_containers, name='top-containers'),
    path('api/stats/general/', views.estadisticas_generales, name='general-stats'),
]
