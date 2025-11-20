from ..models import Board

def get_user_boards(user):
    # Получить все доски пользователя из базы данных
    return Board.objects.filter(owner=user)

def save_board(serializer, user):
    # Сохранить доску с указанным владельцем
    serializer.save(owner=user)
