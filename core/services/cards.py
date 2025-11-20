from ..repositories import cards

def get_cards_for_user(user):
    # Получить все карточки пользователя
    return cards.get_user_cards(user)

def move_card(card, list_id, new_order):
    # Перенести карточку в другой список и обновить порядок
    if list_id:
        card.list_id = list_id
    card.order = new_order
    card.save()
    return card
