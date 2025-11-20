from rest_framework import serializers
from .models import User, Board, List, Card


# Сериализатор для модели User (пользователь)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")  # Сериализуемые поля


# Сериализатор для модели Card (карточка)
class CardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Card
        fields = ("id", "title", "description", "order", "created_at", "list")  # Сериализуемые поля


# Сериализатор для модели List (список)
class ListSerializer(serializers.ModelSerializer):
    # Вложенный список карточек этого списка (read_only=True - только для чтения)
    cards = CardSerializer(many=True, read_only=True)
    class Meta:
        model = List
        fields = ("id", "title", "order", "board", "cards", "color")


# Сериализатор для модели Board (доска)
class BoardSerializer(serializers.ModelSerializer):
    # Вложенный список списков этой доски
    lists = ListSerializer(many=True, read_only=True)
    # Информация о владельце доски включается вложенным сериализатором
    owner = UserSerializer(read_only=True)
    class Meta:
        model = Board
        fields = ("id", "title", "description", "order", "owner", "created_at", "lists")
