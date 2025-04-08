from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import CustomUser, Role, Empresa

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Empresa
        fields = '__all__'

class CustomUserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(queryset=Role.objects.all(), source='role', write_only=True)
    empresa = EmpresaSerializer(read_only=True)
    empresa_id = serializers.PrimaryKeyRelatedField(queryset=Empresa.objects.all(), source='empresa', write_only=True, required=False, allow_null=True)
    
    # Afegim el camp de contrasenya
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=CustomUser.objects.all(), message="Aquest correu electrònic ja està registrat.")]
    )

    is_gestor = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    is_superadmin = serializers.SerializerMethodField()
    is_user = serializers.SerializerMethodField()
    score = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name', 'age', 'location',
            'role', 'role_id', 'empresa', 'empresa_id', 'CP', 'password',
            'is_gestor', 'is_admin', 'is_superadmin', 'is_user', 'score'
        )

    def create(self, validated_data):
        password = validated_data.pop('password')  # separem la password
        user = CustomUser(**validated_data)
        user.set_password(password)  # 🔐 aquí s’encripta!
        user.save()
        return user

    def get_is_gestor(self, obj):
        return obj.is_gestor()

    def get_is_admin(self, obj):
        return obj.is_admin()

    def get_is_superadmin(self, obj):
        return obj.is_superadmin()

    def get_is_user(self, obj):
        return obj.is_user()

    def get_score(self, obj):
        return obj.score  # o obj.get_score() si és una funció
