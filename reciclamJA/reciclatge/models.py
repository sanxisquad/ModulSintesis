from django.db import models
from accounts.models import CustomUser

class Material(models.Model):
    nombre = models.CharField(max_length=100)
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
    
    def __str__(self):
        return f"{self.nombre_producto} - {self.codigo_barras}"
    
    class Meta:
        ordering = ['-fecha_reciclaje']
        verbose_name = "Producte Reciclat"
        verbose_name_plural = "Productes Reciclats"
