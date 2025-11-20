from django.contrib.auth.models import AbstractUser
from django.db import models


# Кастомная модель пользователя, наследуется от AbstractUser
class User(AbstractUser):
    # Email может быть не уникальным
    email = models.EmailField(unique=False)
    # Email обязателен при создании пользователя
    REQUIRED_FIELDS = ["email"]


# Модель "Доска"
class Board(models.Model):
    title = models.CharField(max_length=255)  # Название доски
    description = models.TextField(blank=True)  # Описание (опционально)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="boards")  # Владелец доски
    created_at = models.DateTimeField(auto_now_add=True)  # Дата создания(не использовал, но может пригодиться)
    order = models.PositiveIntegerField(default=0)  # Порядок отображения
    class Meta:
        ordering = ["order"]  # Сортировка досок по order
    def __str__(self):
        return self.title  # Отображение доски в админке и shell


# Модель "Список"
class List(models.Model):
    title = models.CharField(max_length=255)  # Название списка
    board = models.ForeignKey(Board, on_delete=models.CASCADE, related_name="lists")  # Доска, к которой относится список
    order = models.PositiveIntegerField(default=0)  # Порядок отображения
    color = models.CharField(max_length=20, blank=True, default="")  # Цвет (опционально)
    class Meta:
        ordering = ["order"]  # Сортировка списков по order
    def __str__(self):
        return self.title  # Отображение списка


# Модель "Карточка"
class Card(models.Model):
    title = models.CharField(max_length=255)  # Название карточки
    description = models.TextField(blank=True)  # Описание (опционально)
    list = models.ForeignKey(List, on_delete=models.CASCADE, related_name="cards")  # Список, к которому относится карточка
    order = models.PositiveIntegerField(default=0)  # Порядок отображения
    created_at = models.DateTimeField(auto_now_add=True)  # Дата создания(также не использовал, но может пригодиться)
    class Meta:
        ordering = ["order"]  # Сортировка карточек по order
    def __str__(self):
        return self.title  # Отображение карточки
