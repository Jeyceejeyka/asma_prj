from django.core.management.base import BaseCommand
from django.db import transaction
from apps.products.models import Category


class Command(BaseCommand):
    help = "Seed the database with perfume categories"

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing categories before seeding',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options['clear']:
            count, _ = Category.objects.all().delete()
            self.stdout.write(
                self.style.WARNING(f'Deleted {count} existing categories')
            )

        categories_data = [
            'Eau de Parfum',
            'Eau de Toilette',
            'Eau de Cologne',
            'Fragrance Oil',
            'Unisex',
            'Fruity',
            'Floral',
            'Oriental',
            'Fresh',
            'Woody',
            'Spicy',
            'Citrus',
            'Aromatic',
            'Amber',
            'Vanilla',
            'Musk',
            'Spring',
            'Summer',
            'Fall',
            'Winter',
            'Unisex Fragrances',
            'Men\'s Fragrances',
            'Women\'s Fragrances',
        ]

        created_count = 0
        skipped_count = 0

        for category_name in categories_data:
            category, created = Category.objects.get_or_create(
                category_name=category_name
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Created category: {category_name}')
                )
            else:
                skipped_count += 1
                self.stdout.write(
                    self.style.WARNING(f'✗ Skipped (already exists): {category_name}')
                )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Seeding complete! Created: {created_count}, Skipped: {skipped_count}'
            )
        )
