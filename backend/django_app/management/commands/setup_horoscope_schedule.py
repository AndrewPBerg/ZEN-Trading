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
        deleted_count_old, _ = Schedule.objects.filter(
            func='django_app.tasks.generate_daily_horoscopes'
        ).delete()
        
        deleted_count_new, _ = Schedule.objects.filter(
            func='django_app.tasks.check_and_generate_horoscopes'
        ).delete()
        
        total_deleted = deleted_count_old + deleted_count_new
        if total_deleted > 0:
            self.stdout.write(self.style.WARNING(f'Removed {total_deleted} existing horoscope schedule(s)'))
        
        # Create new schedule to check and generate horoscopes every 15 seconds
        schedule = Schedule.objects.create(
            func='django_app.tasks.check_and_generate_horoscopes',
            schedule_type=Schedule.MINUTES,
            minutes=0.25,  # 15 seconds (0.25 minutes)
            name='Check and Generate User Horoscopes',
            repeats=-1  # Repeat indefinitely
        )
        
        self.stdout.write(self.style.SUCCESS(f'✓ Created horoscope schedule: {schedule.name}'))
        self.stdout.write(self.style.SUCCESS('  Schedule: Every 15 seconds'))
        self.stdout.write(self.style.SUCCESS('  Task will run automatically via qcluster'))
        self.stdout.write(self.style.SUCCESS('  Generates horoscopes ONLY for actual users (efficient)'))

