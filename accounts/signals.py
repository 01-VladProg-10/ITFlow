from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import Group
from .models import User


@receiver(post_save, sender=User)
def assign_default_group(sender, instance, created, **kwargs):
    """
    Automatycznie przypisuje nowego użytkownika do grupy 'client',
    jeśli nie jest przypisany do żadnej grupy.
    """
    if created and not instance.groups.exists():
        client_group, _ = Group.objects.get_or_create(name='client')
        instance.groups.add(client_group)
