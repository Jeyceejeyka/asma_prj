import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


User = get_user_model()


class Command(BaseCommand):
    help = "Seed initial admin user"

    def handle(self, *args, **kwargs):

        email = os.getenv("DJANGO_ADMIN_EMAIL")
        password = os.getenv("DJANGO_ADMIN_PASSWORD")
        username = os.getenv("DJANGO_ADMIN_USERNAME", "admin")

        if not email or not password:
            self.stdout.write(
                self.style.ERROR(
                    "Missing DJANGO_ADMIN_EMAIL or DJANGO_ADMIN_PASSWORD"
                )
            )
            return

        if User.objects.filter(email=email).exists():
            self.stdout.write(
                self.style.WARNING(
                    "Admin user already exists"
                )
            )
            return

        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Admin user '{username}' created successfully"
            )
        )