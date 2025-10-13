"""
Management command to set up daily horoscope generation schedule
Usage: python manage.py setup_horoscope_schedule
"""
from django.core.management.base import BaseCommand
from django_q.models import Schedule


class Command(BaseCommand):
    help = 'Set up Django-Q2 scheduled task for daily horoscope generation'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up horoscope generation schedule...'))
        
        # Remove existing horoscope generation schedules to avoid duplicates
        deleted_count, _ = Schedule.objects.filter(
            func='django_app.tasks.generate_daily_horoscopes'
        ).delete()
        
        if deleted_count > 0:
            self.stdout.write(self.style.WARNING(f'Removed {deleted_count} existing horoscope schedule(s)'))
        
        # Create new schedule for daily horoscope generation at 12:00 AM EST
        schedule = Schedule.objects.create(
            func='django_app.tasks.generate_daily_horoscopes',
            schedule_type=Schedule.CRON,
            cron='0 0 * * *',  # Run at midnight (12:00 AM) every day
            name='Daily Horoscope Generation',
            repeats=-1  # Repeat indefinitely
        )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created horoscope schedule: {schedule.name}'))
        self.stdout.write(self.style.SUCCESS(f'  Schedule: {schedule.cron} (Daily at 12:00 AM)'))
        self.stdout.write(self.style.SUCCESS('  Task will run automatically via qcluster'))

