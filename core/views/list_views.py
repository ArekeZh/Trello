from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ..serializers import ListSerializer
from ..services import lists as list_service


class ListViewSet(viewsets.ModelViewSet):
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Возвращаем только списки текущего пользователя(services/lists.py)
        return list_service.get_lists_for_user(self.request.user)

    @action(detail=True, methods=["patch"])
    def reorder(self, request, pk=None):
        # Обновляем порядок списка (drag & drop) (services/lists.py)
        item = self.get_object()
        updated_item = list_service.reorder_list(item, request.data.get("order", item.order))
        return Response(ListSerializer(updated_item).data)
