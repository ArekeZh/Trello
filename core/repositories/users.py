from ..models import User

def get_user_by_email(email):
    # Найти пользователя по email или вернуть None, если не найден
    try:
        return User.objects.get(email=email)
    except User.DoesNotExist:
        return None

def create_user(username, email, password):
    # Создать нового пользователя с указанными данными
    return User.objects.create_user(username=username, email=email, password=password)
