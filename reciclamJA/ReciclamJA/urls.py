from django.contrib import admin
from django.urls import path, include
from rest_framework.documentation import include_docs_urls
from rest_framework.routers import DefaultRouter
from sistema_reciclatge.api import PrizeViewSet, PrizeRedemptionViewSet
from django.conf import settings
from django.conf.urls.static import static

router = DefaultRouter()
router.register(r'premios', PrizeViewSet)
router.register(r'premios-redenciones', PrizeRedemptionViewSet, basename='premio-redencion')

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

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
