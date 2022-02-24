from django.apps import AppConfig
class DashboardConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dashboard'

    def ready(self):
      from .jobs import updater
      updater.startJob()
