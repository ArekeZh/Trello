from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Только владелец объекта может изменять его.
    Для Board, List, Card.
    """
    def has_object_permission(self, request, view, obj):
        return getattr(obj, "owner", None) == request.user or request.method in permissions.SAFE_METHODS
