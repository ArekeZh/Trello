from django.apps import AppConfig

# Конфигурация приложения core (указывается в INSTALLED_APPS в settings.py)
class CoreConfig(AppConfig):
    # Использовать BigAutoField как тип поля для автоинкрементных id по умолчанию
    default_auto_field = "django.db.models.BigAutoField"
    # Имя приложения
    name = "core"
