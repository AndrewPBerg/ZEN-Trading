"""
Management command to manually generate daily horoscopes
Usage: python manage.py generate_horoscopes
"""
from django.core.management.base import BaseCommand
from django_app.tasks import generate_daily_horoscopes


class Command(BaseCommand):
    help = 'Generate daily horoscopes for all zodiac signs and investing styles'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting horoscope generation...'))
        
        try:
            generate_daily_horoscopes()
            self.stdout.write(self.style.SUCCESS('✓ Horoscope generation completed successfully'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Horoscope generation failed: {str(e)}'))
            raise

