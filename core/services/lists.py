from ..repositories import lists

def get_lists_for_user(user):
    # Получить все списки пользователя
    return lists.get_user_lists(user)

def reorder_list(item, new_order):
    # Изменить порядок списка и сохранить
    item.order = new_order
    item.save()
    return item
