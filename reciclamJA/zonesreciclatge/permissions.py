from rest_framework import permissions

class IsEmpresaMember(permissions.BasePermission):
    """
    Permite modificar solo a usuarios que pertenecen a la empresa del recurso.
    Permite ver a todos los usuarios.
    """

    def has_permission(self, request, view):
        # Todos los usuarios pueden ver la lista (GET)
        if view.action in ['list', 'retrieve']:
            return True  
        # Solo usuarios autenticados pueden crear, modificar o eliminar
        return request.user.is_authenticated  

    def has_object_permission(self, request, view, obj):
        # Si es una solicitud de solo lectura, permitir el acceso a todos
        if request.method in permissions.SAFE_METHODS:
            return True  
        # Para modificar, eliminar o crear, el usuario debe ser de la misma empresa
        return request.user.empresa == obj.empresa  
