from ..models import List

def get_user_lists(user):
    # Получить все списки пользователя из связанных досок
    return List.objects.filter(board__owner=user)
