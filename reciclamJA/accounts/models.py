from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta

# Modelo para Roles (si deseas asignar roles a los usuarios)
class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

# Modelo CustomUser extendido de AbstractUser
class CustomUser(AbstractUser):
    age = models.PositiveIntegerField(null=True, blank=True)
    email = models.EmailField(unique=True) 
    location = models.CharField(max_length=255, blank=True, null=True)
    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True)  # Relación con Role
    score = models.IntegerField(default=0)
    total_score = models.IntegerField(default=0)
    empresa = models.ForeignKey('Empresa', related_name='usuarios', on_delete=models.CASCADE, null=True, blank=True)  # Relación uno a muchos: cada usuario pertenece a una empresa
    CP = models.CharField(max_length=5, blank=True, null=True)
    tickets_rechazados_acumulados = models.PositiveIntegerField(default=0)  # Contador de tickets rechazados
    ultima_penalizacion = models.DateTimeField(null=True, blank=True)  # Fecha de la última penalización
    ultimo_ticket_rechazado = models.DateTimeField(null=True, blank=True)  # Fecha del último ticket rechazado

    def __str__(self):
        return self.username

    def is_gestor(self):
        return self.role and self.role.name.upper() == 'GESTOR'  # Verifica si el rol es 'GESTOR'

    def is_admin(self):
        return self.role and self.role.name.upper() == 'ADMIN'  # Verifica si el rol es 'ADMIN'
    def is_superadmin(self):
        return self.role and self.role.name.upper() == 'SUPERADMIN' 
    def is_user(self):
        return self.role and self.role.name.upper() == 'USER'  
    
    def verificar_inactividad_tickets_rechazados(self):
        """Verifica si han pasado 6 meses desde el último ticket rechazado"""
        if not self.ultimo_ticket_rechazado:
            return False
            
        seis_meses = timezone.now() - timedelta(days=180)  # Aproximadamente 6 meses
        if self.ultimo_ticket_rechazado < seis_meses:
            # Han pasado más de 6 meses, resetear el contador
            self.tickets_rechazados_acumulados = 0
            # No modificamos ultimo_ticket_rechazado para mantener la referencia de tiempo
            self.save(update_fields=['tickets_rechazados_acumulados'])
            return True
        return False

    def aplicar_penalizacion_tickets_rechazados(self):
        """Aplica una penalización si el usuario ha acumulado 5 tickets rechazados"""
        from zonesreciclatge.models import Notificacion
        
        if self.tickets_rechazados_acumulados >= 5:
            # Restar puntos
            self.score -= 500
            self.total_score -= 500
            if self.score < 0:
                self.score = 0  # Evitar puntuación negativa si se desea
                self.total_score = 0
                
            # Resetear contador a 0 después de aplicar la penalización
            self.tickets_rechazados_acumulados = 0
            self.ultima_penalizacion = timezone.now()
            
            # Crear notificación
            Notificacion.objects.create(
                usuario=self,
                tipo='sistema',
                titulo='Penalització per acumulació de tiquets rebutjats',
                mensaje='Has rebut una penalització de -500 punts per acumular 5 tiquets rebutjats. Si us plau, revisa la qualitat dels teus informes.'
            )
            
            self.save()
            return True
        return False

# Modelo para Empresa
class Empresa(models.Model):
    nom = models.CharField(max_length=255)
    NIF = models.CharField(max_length=9, unique=True)  # NIF único para cada empresa
    direccio = models.CharField(max_length=255)
    telefon = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(max_length=255, blank=True, null=True)
    CP = models.CharField(max_length=5, blank=True, null=True)

    def __str__(self):
        return self.nom
