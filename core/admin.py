from django.contrib import admin
from .models import User, Board, List, Card


# Настройка отображения модели User в админке
@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    # Показывать эти поля в списке пользователей
    list_display = ("id", "username", "email", "is_staff", "is_active")
    # Позволяет искать по username и email
    search_fields = ("username", "email")


# Настройка отображения модели Board (доски) в админке
@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "owner", "order", "created_at")
    # Фильтр по владельцу доски
    list_filter = ("owner",)
    # Поиск по названию доски
    search_fields = ("title",)


# Настройка отображения модели List (список) в админке
@admin.register(List)
class ListAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "board", "order")
    # Фильтр по доске
    list_filter = ("board",)
    # Поиск по названию списка
    search_fields = ("title",)


# Настройка отображения модели Card (карточка) в админке
@admin.register(Card)
class CardAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "list", "order", "created_at")
    # Фильтр по списку
    list_filter = ("list",)
    # Поиск по названию и описанию карточки
    search_fields = ("title", "description")
