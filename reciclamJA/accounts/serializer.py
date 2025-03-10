from rest_framework import serializers
from .models import CustomUser, Role, Empresa

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'  # O los campos que necesites

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'  # O los campos que necesites de la empresa

class CustomUserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)  # Detalles del rol
    role_id = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), source='role', write_only=True)  # ID del rol
    empresa = EmpresaSerializer(read_only=True)  # Detalles de la empresa
    empresa_id = serializers.PrimaryKeyRelatedField(queryset=Empresa.objects.all(), source='empresa', write_only=True)  # ID de la empresa
    is_gestor = serializers.SerializerMethodField()  # Agregar el campo is_gestor

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'age', 'location', 'role', 'role_id', 'empresa', 'empresa_id', 'is_gestor')

    def get_is_gestor(self, obj):
        return obj.is_gestor()  # Llamar al método is_gestor del modelo
