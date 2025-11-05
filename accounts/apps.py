from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
<<<<<<< HEAD

    def ready(self):
        import accounts.signals
=======
>>>>>>> faca724ca2cf11acb780b4774eaae6fe9b4e5fbb
