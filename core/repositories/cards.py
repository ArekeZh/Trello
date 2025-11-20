from ..models import Card

def get_user_cards(user):
    # Получить все карточки пользователя по связи с владельцем доски
    return Card.objects.filter(list__board__owner=user)
