from rest_framework import serializers
from .models import Material, ProductoReciclado, BolsaVirtual, Prize, PrizeRedemption

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class BolsaVirtualSerializer(serializers.ModelSerializer):
    tipo_material = MaterialSerializer(read_only=True)
    tipo_material_id = serializers.PrimaryKeyRelatedField(
        source='tipo_material', 
        queryset=Material.objects.all(),
        write_only=True
    )
    productos_count = serializers.SerializerMethodField()
    
    class Meta:
        model = BolsaVirtual
        fields = [
            'id', 'usuario', 'tipo_material', 'tipo_material_id', 'nombre',
            'fecha_creacion', 'fecha_reciclaje', 'reciclada', 
            'contenedor_reciclaje', 'puntos_totales', 'productos_count'
        ]
        read_only_fields = ['usuario', 'fecha_creacion', 'fecha_reciclaje', 'reciclada', 'puntos_totales']
    
    def get_productos_count(self, obj):
        return obj.productos.count()

class ProductoRecicladoSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    bolsa_id = serializers.PrimaryKeyRelatedField(
        source='bolsa',
        queryset=BolsaVirtual.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )
    
    class Meta:
        model = ProductoReciclado
        fields = [
            'id', 'usuario', 'material', 'bolsa', 'bolsa_id', 'puntos_obtenidos', 'fecha_reciclaje'
        ]
        read_only_fields = ('usuario', 'puntos_obtenidos', 'fecha_reciclaje')
        
class CodigoBarrasSerializer(serializers.Serializer):
    codigo = serializers.CharField(max_length=50)

class PrizeSerializer(serializers.ModelSerializer):
    empresa_nombre = serializers.SerializerMethodField()
    creado_por_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Prize
        fields = [
            'id', 'nombre', 'descripcion', 'imagen', 'puntos_costo', 
            'cantidad', 'empresa', 'empresa_nombre', 'creado_por',
            'creado_por_nombre', 'fecha_creacion', 'activo'
        ]
        read_only_fields = ['creado_por', 'fecha_creacion']
    
    def get_empresa_nombre(self, obj):
        return obj.empresa.nom if obj.empresa else None
    
    def get_creado_por_nombre(self, obj):
        return obj.creado_por.username

class PrizeRedemptionSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.SerializerMethodField()
    premio_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = PrizeRedemption
        fields = [
            'id', 'usuario', 'usuario_nombre', 'premio', 'premio_nombre',
            'fecha_redencion', 'puntos_gastados', 'estado',
            'codigo_confirmacion', 'notas'
        ]
        read_only_fields = ['usuario', 'premio', 'fecha_redencion', 
                           'puntos_gastados', 'codigo_confirmacion']
    
    def get_usuario_nombre(self, obj):
        return obj.usuario.username
    
    def get_premio_nombre(self, obj):
        return obj.premio.nombre
