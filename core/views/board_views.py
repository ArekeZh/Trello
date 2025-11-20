from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ..serializers import BoardSerializer
from ..services import boards as board_service


class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Возвращаем только доски текущего пользователя(services/boards.py)
        return board_service.get_boards_for_user(self.request.user)

    def perform_create(self, serializer):
        # Сохраняем новую доску через сервис(services/boards.py)
        board_service.create_board(serializer, self.request.user)

    @action(detail=True, methods=["patch"])
    def reorder(self, request, pk=None):
        # Обновляем порядок доски (drag & drop) через сервис(services/boards.py)
        board = self.get_object()
        updated_board = board_service.reorder_board(board, request.data.get("order"))
        return Response(BoardSerializer(updated_board).data)
