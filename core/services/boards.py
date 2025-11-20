from ..repositories import boards

def get_boards_for_user(user):
    # Получить все доски пользователя
    return boards.get_user_boards(user)

def create_board(serializer, user):
    # Сохранить новую доску для пользователя
    return boards.save_board(serializer, user)

def reorder_board(board, new_order):
    # Изменить порядок доски и сохранить
    board.order = new_order
    board.save()
    return board
