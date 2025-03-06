from django.contrib import admin
from django.urls import path, include
from rest_framework.documentation import include_docs_urls

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Ruta para las tareas (si tienes alguna app de tareas)
    path('tasks/', include('tasks.urls', namespace='tasks')),

    path('auth/', include('accounts.urls', namespace='auth')),  # Aquí llamamos a las rutas de 'accounts'

    # Documentación API
    path('docs/', include_docs_urls(title='API Documentation')),
]
