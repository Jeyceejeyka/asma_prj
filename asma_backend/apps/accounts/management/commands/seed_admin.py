import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand


User = get_user_model()


class Command(BaseCommand):
    help = "Create or update the initial admin user."

    def handle(self, *args, **kwargs):
        email = os.getenv("DJANGO_ADMIN_EMAIL")
        password = os.getenv("DJANGO_ADMIN_PASSWORD")
        username = os.getenv("DJANGO_ADMIN_USERNAME", "admin")

        if not email or not password:
            self.stdout.write(
                self.style.ERROR(
                    "DJANGO_ADMIN_EMAIL and DJANGO_ADMIN_PASSWORD must be set."
                )
            )
            return

        # Find an existing user by email or username
        user = (
            User.objects.filter(email=email).first()
            or User.objects.filter(username=username).first()
        )

        if user:
            updated = False

            if user.username != username:
                user.username = username
                updated = True

            if user.email != email:
                user.email = email
                updated = True

            if not user.is_staff:
                user.is_staff = True
                updated = True

            if not user.is_superuser:
                user.is_superuser = True
                updated = True

            if not user.check_password(password):
                user.set_password(password)
                updated = True

            if updated:
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Admin user '{username}' updated successfully."
                    )
                )
            else:
                self.stdout.write(
                    self.style.WARNING(
                        "Admin user already exists and is up to date."
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
                f"Admin user '{username}' created successfully."
            )
        )