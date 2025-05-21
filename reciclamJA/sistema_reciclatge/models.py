from django.db import models
from accounts.models import CustomUser
from django.conf import settings
from django.utils import timezone
import random
import string

class Material(models.Model):
    TIPOS_CHOICES = [
        ('plàstic', 'Plàstic'),
        ('paper', 'Paper/Cartró'),
        ('vidre', 'Vidre'),
        ('orgànic', 'Orgànic'),
        ('rebuig', 'Rebuig'),
        ('indiferenciat', 'Indiferenciat'),
    ]
    
    nombre = models.CharField(max_length=100, choices=TIPOS_CHOICES)
    descripcion = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=7, default="#000000")  # Formato HEX del color
    puntos = models.IntegerField(default=10)  # Puntos que se otorgan por reciclar este material
    contenedor = models.CharField(max_length=50)  # Tipo de contenedor (azul, amarillo, verde, etc.)
    
    def __str__(self):
        return self.get_nombre_display() or self.nombre
        
    class Meta:
        verbose_name = "Material"
        verbose_name_plural = "Materials"
        
    @staticmethod
    def normalize_material_name(material_name):
        """
        Normalizes material names from different sources (same function as in views.py)
        """
        if not material_name:
            return None
            
        # Convert to lowercase for case-insensitive matching
        material_name = material_name.lower().strip()
        
        # Mapping from various names to our standardized database names
        material_mapping = {
            # Spanish to Catalan
            'plastico': 'plàstic',
            'plástico': 'plàstic',
            'papel': 'paper',
            'vidrio': 'vidre',
            'organico': 'orgànic',
            'orgánico': 'orgànic',
            'resto': 'rebuig',
            'metal': 'plàstic',  # Metal goes in plastic container
            
            # English to Catalan
            'plastic': 'plàstic',
            'paper': 'paper',
            'glass': 'vidre',
            'organic': 'orgànic',
            'waste': 'rebuig',
            'metal': 'plàstic',
            
            # Common variations
            'carton': 'paper',
            'cartón': 'paper',
            'cartró': 'paper',
            'metall': 'plàstic',
        }
        
        # Return the normalized name or the original if not found
        return material_mapping.get(material_name, material_name)

class ProductoReciclado(models.Model):
    usuario = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='productos_reciclados')
    codigo_barras = models.CharField(max_length=50)
    nombre_producto = models.CharField(max_length=255, blank=True, null=True)
    material = models.ForeignKey(Material, on_delete=models.SET_NULL, null=True, related_name='productos')
    marca = models.CharField(max_length=255, blank=True, null=True)
    puntos_obtenidos = models.IntegerField(default=0)
    imagen_url = models.URLField(blank=True, null=True)
    fecha_reciclaje = models.DateTimeField(auto_now_add=True)
    bolsa = models.ForeignKey('BolsaVirtual', on_delete=models.SET_NULL, null=True, blank=True, related_name='productos')
    
    def __str__(self):
        return f"{self.nombre_producto} - {self.codigo_barras}"
    
    class Meta:
        ordering = ['-fecha_reciclaje']
        verbose_name = "Producte Reciclat"
        verbose_name_plural = "Productes Reciclats"

class BolsaVirtual(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bolsas')
    tipo_material = models.ForeignKey(Material, on_delete=models.CASCADE, related_name='bolsas')
    nombre = models.CharField(max_length=100, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_reciclaje = models.DateTimeField(null=True, blank=True)
    reciclada = models.BooleanField(default=False)
    contenedor_reciclaje = models.ForeignKey('zonesreciclatge.Contenedor', on_delete=models.SET_NULL, null=True, blank=True)
    puntos_totales = models.IntegerField(default=0)
    
    def __str__(self):
        return f"Bolsa de {self.tipo_material.nombre} de {self.usuario.username}"
    
    def calcular_puntos(self):
        """Calcula el total de puntos en la bolsa basado en los productos"""
        return self.productos.aggregate(models.Sum('puntos_obtenidos'))['puntos_obtenidos__sum'] or 0
    
    def reciclar(self, contenedor=None):
        """Marca la bolsa como reciclada y otorga puntos al usuario"""
        if self.reciclada:
            return False
            
        # Calcular puntos si no se ha hecho antes
        if self.puntos_totales == 0:
            self.puntos_totales = self.calcular_puntos()
            
        # Asignar contenedor si se proporciona
        if contenedor:
            self.contenedor_reciclaje = contenedor
            
        # Marcar como reciclada
        self.reciclada = True
        self.fecha_reciclaje = timezone.now()
        self.save()
        
        # Añadir puntos al usuario
        self.usuario.score += self.puntos_totales
        self.usuario.save(update_fields=['score'])
        
        return True
    
    class Meta:
        verbose_name = "Bossa Virtual"
        verbose_name_plural = "Bosses Virtuals"

class Prize(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    imagen = models.ImageField(upload_to='prizes/', null=True, blank=True)
    puntos_costo = models.PositiveIntegerField()
    cantidad = models.PositiveIntegerField(default=0)
    empresa = models.ForeignKey('accounts.Empresa', on_delete=models.SET_NULL, null=True, blank=True, related_name='prizes')
    creado_por = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='prizes_created')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    activo = models.BooleanField(default=True)
    
    def __str__(self):
        return self.nombre
    
    @property
    def is_available(self):
        return self.activo and self.cantidad > 0
    
    class Meta:
        verbose_name = "Premi"
        verbose_name_plural = "Premis"
        
class PrizeRedemption(models.Model):
    ESTADO_CHOICES = (
        ('pendiente', 'Pendent de lliurament'),
        ('procesando', 'En procés'),
        ('entregado', 'Lliurat'),
        ('cancelado', 'Cancel·lat'),
    )
    
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='redemptions')
    premio = models.ForeignKey(Prize, on_delete=models.CASCADE, related_name='redemptions')
    fecha_redencion = models.DateTimeField(auto_now_add=True)
    puntos_gastados = models.PositiveIntegerField()
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    codigo_confirmacion = models.CharField(max_length=20, null=True, blank=True)
    notas = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.usuario.username} - {self.premio.nombre} - {self.fecha_redencion.strftime('%d/%m/%Y')}"
    
    def save(self, *args, **kwargs):
        # Generate a confirmation code if not present
        if not self.codigo_confirmacion:
            self.codigo_confirmacion = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        
        # If this is a new redemption (not yet saved)
        if self.pk is None:
            # Reduce the quantity of available prizes
            self.premio.cantidad -= 1
            self.premio.save()
            
            # Deduct points from user
            self.usuario.score -= self.puntos_gastados
            self.usuario.save(update_fields=['score'])
            
            # If related to a company, create notification for company managers
            if self.premio.empresa:
                from zonesreciclatge.models import Notificacion
                gestores = self.premio.empresa.usuarios.filter(
                    role__name__in=['GESTOR', 'ADMIN', 'SUPERADMIN']
                )
                
                for gestor in gestores:
                    Notificacion.objects.create(
                        usuario=gestor,
                        tipo='premi',
                        titulo=f'Nova sol·licitud de premi: {self.premio.nombre}',
                        mensaje=f'Usuari {self.usuario.username} ha sol·licitat el premi "{self.premio.nombre}".\nCodi de confirmació: {self.codigo_confirmacion}'
                    )
        
        super().save(*args, **kwargs)
    
    class Meta:
        verbose_name = "Redempció de Premi"
        verbose_name_plural = "Redempcions de Premis"
        ordering = ['-fecha_redencion']
