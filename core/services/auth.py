from rest_framework.authtoken.models import Token
from ..repositories import users

def register_user(username, email, password):
    # Проверяем существует ли пользователь с данным email - нельзя регистрировать двух с одним email
    if users.get_user_by_email(email):
        return None, "Пользователь с таким email уже существует"
    
    # Создаём нового пользователя и генерируем для него токен авторизации
    user = users.create_user(username, email, password)
    token = Token.objects.create(user=user)
    return (user, token), None

def login_user(email, password):
    # Ищем пользователя по email
    user = users.get_user_by_email(email)
    # Проверяем пароль
    if user and user.check_password(password):
        # Получаем или создаем токен для пользователя
        token, _ = Token.objects.get_or_create(user=user)
        return (user, token), None
    return None, "Invalid credentials"

def logout_user(user):
    # Удаляем токен пользователя
    user.auth_token.delete()
