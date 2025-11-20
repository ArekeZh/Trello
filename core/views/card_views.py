from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from ..serializers import CardSerializer
from ..services import cards as card_service


class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Возвращаем только карточки по текущему пользователю(services/cards.py)
        return card_service.get_cards_for_user(self.request.user)

    @action(detail=True, methods=["patch"])
    def move(self, request, pk=None):
        # Перемещаем карточку (drag & drop) в другой список и изменяем порядок(services/cards.py)
        card = self.get_object()
        list_id = request.data.get("list")
        order = request.data.get("order", card.order)
        updated_card = card_service.move_card(card, list_id, order)
        return Response(CardSerializer(updated_card).data)
