from rest_framework import serializers
from .models import Material, ProductoReciclado

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

class ProductoRecicladoSerializer(serializers.ModelSerializer):
    material = MaterialSerializer(read_only=True)
    
    class Meta:
        model = ProductoReciclado
        fields = '__all__'
        read_only_fields = ('usuario', 'puntos_obtenidos', 'fecha_reciclaje')
        
class CodigoBarrasSerializer(serializers.Serializer):
    codigo = serializers.CharField(max_length=50)
