from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.response import Response
from ..serializers import UserSerializer
from ..services import auth as auth_service


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Регистрируем нового пользователя через сервисную функцию(services/auth.py)
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")
        result, error = auth_service.register_user(username, email, password)
        if error:
            return Response({"detail": error}, status=400)
        user, token = result
        return Response({"token": token.key, "user": UserSerializer(user).data})


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Логиним пользователя через сервисную функцию(services/auth.py)
        email = request.data.get("email")
        password = request.data.get("password")
        result, error = auth_service.login_user(email, password)
        if error:
            return Response({"detail": error}, status=400)
        user, token = result
        return Response({"token": token.key, "user": UserSerializer(user).data})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # Выходим из авторизации, удаляя токен пользователя(services/auth.py)
        auth_service.logout_user(request.user)
        return Response(status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Возвращаем информацию о текущем пользователе
        return Response(UserSerializer(request.user).data)
