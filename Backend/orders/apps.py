from django.apps import AppConfig


class OrdersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'orders'

    def ready(self):
        # Подключаем сигналы только при инициализации приложения
        from . import signals  # noqa: F401
