from rest_framework import permissions
from accounts.models import CustomUser

class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role.name.upper() == 'SUPERADMIN'

class IsAdminEmpresa(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin()
    
    def has_object_permission(self, request, view, obj):
        # Para modelos con relación directa a empresa
        if hasattr(obj, 'empresa'):
            return obj.empresa == request.user.empresa
        # Para usuarios
        if isinstance(obj, CustomUser):
            return obj.empresa == request.user.empresa
        return True

class IsGestor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_gestor()
    
    def has_object_permission(self, request, view, obj):
        return obj.empresa == request.user.empresa

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
class CombinedPermission(permissions.BasePermission):
    def __init__(self, *permission_classes):
        self.permission_classes = permission_classes

    def has_permission(self, request, view):
        return any(
            perm().has_permission(request, view)
            for perm in self.permission_classes
        )