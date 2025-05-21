from django.db import models
from accounts.models import CustomUser
from django.conf import settings
from django.utils import timezone

class Material(models.Model):
    TIPOS_CHOICES = [
        ('paper', 'Paper/Cartró'),
        ('plàstic', 'Plàstic'),
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
        return self.nombre
        
    class Meta:
        verbose_name = "Material"
        verbose_name_plural = "Materials"

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
