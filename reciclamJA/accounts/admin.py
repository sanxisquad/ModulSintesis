from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from .models import CustomUser, Role, Empresa

# Formularios personalizados para la creación y edición de usuarios
class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name', 'age', 'location', 'role', 'empresa')

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = ('username', 'email', 'first_name', 'last_name', 'age', 'location', 'role', 'empresa')


class CustomUserAdmin(UserAdmin):
    model = CustomUser
    
    # Campos que se mostrarán en la lista de usuarios
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'age', 'location', 'role', 'score', 'empresa']
    
    # Filtros para la lista de usuarios
    list_filter = ['is_active', 'is_staff', 'role']
    
    # Búsqueda por campos
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    # Ordenación por el campo 'username'
    ordering = ['username']
    
    # Configuración de los campos que se muestran en el formulario de edición
    fieldsets = (
        (None, {'fields': ('username', 'password')}),  # Asegúrate de que 'password' esté aquí
        ('Personal info', {'fields': ('first_name', 'last_name', 'email', 'age', 'location')}),  
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),  
        ('Role and Company', {'fields': ('role', 'empresa')}),  
        ('Important dates', {'fields': ('last_login', 'date_joined')}),  
    )

    # Los campos que se mostrarán cuando agregues un nuevo usuario
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'first_name', 'last_name', 'email', 'age', 'location', 'role', 'empresa', 'is_active', 'is_staff'),
        }),
    )

    # Usamos los formularios personalizados para la creación y edición de usuarios
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm

# Registrar el modelo con su clase de administración personalizada
admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Role)
admin.site.register(Empresa)
