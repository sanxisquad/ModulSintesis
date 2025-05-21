from django.contrib import admin
from .models import Material, ProductoReciclado, Prize, PrizeRedemption

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

@admin.register(Prize)
class PrizeAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'puntos_costo', 'cantidad', 'empresa', 'creado_por', 'activo')
    list_filter = ('activo', 'empresa')
    search_fields = ('nombre', 'descripcion')

@admin.register(PrizeRedemption)
class PrizeRedemptionAdmin(admin.ModelAdmin):
    list_display = ('usuario', 'premio', 'fecha_redencion', 'puntos_gastados', 'estado')
    list_filter = ('estado', 'premio')
    search_fields = ('usuario__username', 'premio__nombre', 'codigo_confirmacion')
