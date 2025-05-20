from rest_framework import serializers
from .models import Material, ProductoReciclado, BolsaVirtual

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
