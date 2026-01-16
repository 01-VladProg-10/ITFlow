from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group
from accounts.models import User


class Command(BaseCommand):
    help = "Assigns 'client' group to users without any group"

    def handle(self, *args, **kwargs):
        client_group, _ = Group.objects.get_or_create(name='client')
        users_without_group = User.objects.filter(groups__isnull=True).distinct()

        count = users_without_group.count()
        for user in users_without_group:
            user.groups.add(client_group)

        self.stdout.write(
            self.style.SUCCESS(f"✅ {count} user(s) assigned to 'client' group")
        )
