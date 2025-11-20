from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views.auth_views import RegisterView, LoginView, LogoutView, MeView
from .views.board_views import BoardViewSet
from .views.list_views import ListViewSet
from .views.card_views import CardViewSet

# Роутер для ViewSet-ов (boards, lists, cards)
router = DefaultRouter()
router.register(r'boards', BoardViewSet, basename='board')
router.register(r'lists', ListViewSet, basename='list')
router.register(r'cards', CardViewSet, basename='card')

urlpatterns = [
    # Эндпоинты для регистрации, входа, выхода и получения профиля пользователя
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', MeView.as_view(), name='me'),
    # CRUD и кастомные действия для досок, списков и карточек (через router)
    path('', include(router.urls)),
]
