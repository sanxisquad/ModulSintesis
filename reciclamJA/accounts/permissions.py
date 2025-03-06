from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """
    Permiso para que solo los usuarios con rol 'admin' puedan acceder a la vista.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role.name == 'admin'
