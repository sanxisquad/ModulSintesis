from django.apps import AppConfig


class ZonesreciclatgeConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'zonesreciclatge'
    
    def ready(self):
        # Import signals to register them
        import zonesreciclatge.signals