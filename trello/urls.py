from django.contrib import admin
from django.urls import path, include
from django.shortcuts import render

# Главная страница приложения
def home(request):
    return render(request, "home.html")

# Страница детали конкретной доски (по её id)
def board_detail(request, board_id):
    return render(request, "board_detail.html")

urlpatterns = [
    # Админка Django
    path("admin/", admin.site.urls),
    # Все API-эндпоинты приложения (REST)
    path("api/", include("core.urls")),
    # Корневой маршрут - главная страница
    path("", home, name="home"),
    # Детальная страница доски (по id)
    path("board/<int:board_id>/", board_detail, name="board-detail"),  # это и есть страница одной доски
]
