from rest_framework import serializers
from .models import ZonesReciclatge, Contenedor, ReporteContenedor, Notificacion
from accounts.models import Empresa  
from django.contrib.auth import get_user_model

# Get the custom user model
CustomUser = get_user_model()

# Serializer for User (Basic information)
class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name']  # Basic user fields

# Serializer para el modelo Empresa (Solo lectura)
class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = ['id', 'nom', 'NIF', 'direccio', 'telefon', 'email']

# Serializer para el modelo ZonesReciclatge
class ZonesReciclatgeSerializer(serializers.ModelSerializer):
    empresa = EmpresaSerializer(read_only=True)  # Solo lectura, asignado automáticamente
    num_contenedores = serializers.SerializerMethodField()

    class Meta:
        model = ZonesReciclatge
        fields = ['id', 'nom', 'ciutat', 'empresa', 'latitud', 'longitud', 'descripcio', 'num_contenedores']

    def get_num_contenedores(self, obj):
        return obj.contenedors.count()

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


class ReporteContenedorSerializer(serializers.ModelSerializer):
    usuario = serializers.HiddenField(default=serializers.CurrentUserDefault())
    usuario_data = UserBasicSerializer(source='usuario', read_only=True)
    tipo_objeto = serializers.ChoiceField(
        choices=[('contenedor', 'Contenedor'), ('zona', 'Zona')],
        write_only=True,
        required=True
    )
    objeto_id = serializers.IntegerField(write_only=True, required=True)

    class Meta:
        model = ReporteContenedor
        fields = [
            'id', 'tipo', 'prioridad', 'descripcion', 'imagen', 
            'estado', 'fecha', 'usuario', 'usuario_data','tipo_objeto', 'objeto_id',
            'contenedor', 'zona'
        ]
        read_only_fields = ['id', 'fecha', 'estado', 'contenedor', 'zona']

    def validate(self, data):
        tipo_objeto = data.get('tipo_objeto')
        objeto_id = data.get('objeto_id')
        request = self.context.get('request')

        if tipo_objeto == 'contenedor':
            try:
                contenedor = Contenedor.objects.get(pk=objeto_id)
                data['contenedor'] = contenedor
                # Asegurarnos de que la empresa está disponible
                if not contenedor.empresa:
                    raise serializers.ValidationError({"objeto_id": "El contenedor no tiene empresa asignada"})
            except Contenedor.DoesNotExist:
                raise serializers.ValidationError({"objeto_id": "Contenedor no encontrado"})
        elif tipo_objeto == 'zona':
            try:
                zona = ZonesReciclatge.objects.get(pk=objeto_id)
                data['zona'] = zona
                # Asegurarnos de que la empresa está disponible
                if not zona.empresa:
                    raise serializers.ValidationError({"objeto_id": "La zona no tiene empresa asignada"})
            except ZonesReciclatge.DoesNotExist:
                raise serializers.ValidationError({"objeto_id": "Zona no encontrada"})

        return data

    def create(self, validated_data):
        # Eliminamos los campos auxiliares que no son del modelo
        validated_data.pop('tipo_objeto', None)
        validated_data.pop('objeto_id', None)
        
        # Establecemos prioridad media por defecto si no se especifica
        if 'prioridad' not in validated_data:
            validated_data['prioridad'] = 'media'
        if 'contenedor' in validated_data:
            validated_data['empresa'] = validated_data['contenedor'].empresa
        elif 'zona' in validated_data:
            validated_data['empresa'] = validated_data['zona'].empresa
            
        return super().create(validated_data)

class NotificacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notificacion
        fields = ['id', 'tipo', 'titulo', 'mensaje', 'fecha', 'leida', 
                  'relacion_contenedor', 'relacion_zona', 'relacion_reporte']
        read_only_fields = ['id', 'fecha']