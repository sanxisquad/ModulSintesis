from rest_framework import serializers
from .models import ZonesReciclatge, Contenedor
from accounts.models import Empresa  

# Serializer para el modelo Empresa (Solo lectura)
class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['id', 'nom', 'NIF', 'direccio', 'telefon', 'email']

# Serializer para el modelo ZonesReciclatge
class ZonesReciclatgeSerializer(serializers.ModelSerializer):
    empresa = EmpresaSerializer(read_only=True)  # Solo lectura, asignado automáticamente

    class Meta:
        model = ZonesReciclatge
        fields = ['id', 'nom', 'ciutat', 'empresa', 'latitud', 'longitud', 'descripcio']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['empresa'] = user.empresa  # Asigna la empresa del usuario
        return super().create(validated_data)

# Serializer para el modelo Contenedor
class ContenedorSerializer(serializers.ModelSerializer):
    zona = serializers.PrimaryKeyRelatedField(
        queryset=ZonesReciclatge.objects.all(), 
        allow_null=True, 
        required=False  
    )
    zona_nombre = serializers.CharField(source='zona.nom', read_only=True)
    empresa = EmpresaSerializer(read_only=True)  # Solo lectura, la asignamos en `create`

    class Meta:
        model = Contenedor
        fields = ['id', 'zona', 'empresa', 'tipus', 'estat','zona_nombre', 'latitud', 'longitud', 'ciutat', 'cod']

    def create(self, validated_data):
        """Asigna automáticamente la empresa del usuario autenticado al crear un contenedor."""
        user = self.context['request'].user
        validated_data['empresa'] = user.empresa
        return super().create(validated_data)
