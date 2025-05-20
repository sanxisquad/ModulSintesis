from django.urls import path
from . import views

app_name = 'sistema_reciclatge'

urlpatterns = [
    path('escanejar/', views.escanear_codigo, name='escanear_codigo'),
    path('historial/', views.historial_reciclaje, name='historial_reciclaje'),
]
