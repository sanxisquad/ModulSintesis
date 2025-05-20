from django.contrib import admin
from .models import Material, ProductoReciclado

@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'contenedor', 'puntos', 'color')
    search_fields = ('nombre', 'contenedor')

@admin.register(ProductoReciclado)
class ProductoRecicladoAdmin(admin.ModelAdmin):
    list_display = ('nombre_producto', 'codigo_barras', 'usuario', 'material', 'puntos_obtenidos', 'fecha_reciclaje')
    list_filter = ('material', 'fecha_reciclaje')
    search_fields = ('nombre_producto', 'codigo_barras', 'usuario__username')
    date_hierarchy = 'fecha_reciclaje'
