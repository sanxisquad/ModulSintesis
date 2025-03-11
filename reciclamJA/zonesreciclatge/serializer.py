from rest_framework import serializers
from .models import ZonesReciclatge, Contenedor
from accounts.models import Empresa  # Asegúrate de importar la clase Empresa si la necesitas

# Serializer para el modelo Empresa (si necesitas mostrar la empresa asociada)
class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['id', 'nom', 'NIF', 'direccio', 'telefon', 'email']

# Serializer para el modelo ZonesReciclatge
class ZonesReciclatgeSerializer(serializers.ModelSerializer):
    empresa = EmpresaSerializer(read_only=True)  # Relación con la empresa, si quieres incluir los datos de la empresa
    # Si prefieres solo mostrar el ID de la empresa, usa esto en vez del serializer:
    # empresa = serializers.PrimaryKeyRelatedField(queryset=Empresa.objects.all())

    class Meta:
        model = ZonesReciclatge
        fields = ['id', 'nom', 'ciutat', 'empresa', 'latitud', 'longitud', 'descripcio']

# Serializer para el modelo Contenedor
class ContenedorSerializer(serializers.ModelSerializer):
    # Usamos PrimaryKeyRelatedField para que solo se envíen los IDs de las relaciones
    zona = serializers.PrimaryKeyRelatedField(queryset=ZonesReciclatge.objects.all())  # Solo el ID de la zona
    empresa = serializers.PrimaryKeyRelatedField(queryset=Empresa.objects.all())  # Solo el ID de la empresa

    class Meta:
        model = Contenedor
        fields = ['id', 'zona', 'empresa', 'tipus', 'estat', 'latitud', 'longitud', 'ciutat', 'cod']
