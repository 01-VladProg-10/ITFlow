from django.apps import AppConfig

class NortificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'nortifications'

    def ready(self):
        import nortifications.signals
