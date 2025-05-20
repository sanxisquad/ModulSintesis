from django.contrib import admin
from django.urls import path, include
from rest_framework.documentation import include_docs_urls

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # Authentication and other apps
    path('auth/', include('accounts.urls', namespace='auth')),
    path('zr/', include('zonesreciclatge.urls', namespace='zr')),
    
    # Sistema reciclatge - temporarily remove namespace for testing
    path('api/reciclar/', include('sistema_reciclatge.urls')),
    
    # Documentation
    path('docs/', include_docs_urls(title='API Documentation')),
]
