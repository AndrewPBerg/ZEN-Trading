"""
Management command to set up the scheduled task for stock price updates
"""
from django.core.management.base import BaseCommand
from django_q.models import Schedule


class Command(BaseCommand):
    help = 'Set up scheduled task for updating stock prices every 10 seconds'

    def handle(self, *args, **options):
        # Check if schedule already exists
        schedule_name = 'update_stock_prices'
        
        if Schedule.objects.filter(name=schedule_name).exists():
            self.stdout.write(self.style.WARNING(f'Schedule "{schedule_name}" already exists. Deleting and recreating...'))
            Schedule.objects.filter(name=schedule_name).delete()
        
        # Create the schedule
        # Schedule types: 'I' = Minutes (interval), 'H' = Hourly, 'D' = Daily, 'W' = Weekly, 'M' = Monthly, 'Q' = Quarterly, 'Y' = Yearly
        schedule = Schedule.objects.create(
            name=schedule_name,
            func='django_app.tasks.update_stock_prices',
            schedule_type='I',  # 'I' for interval (minutes)
            minutes=10/60,  # 10 seconds = 0.1667 minutes
            repeats=-1,  # Repeat indefinitely
        )
        
        self.stdout.write(self.style.SUCCESS(
            f'Successfully created schedule: "{schedule_name}"'
        ))
        self.stdout.write(f'  Function: {schedule.func}')
        self.stdout.write(f'  Interval: Every 10 seconds')
        self.stdout.write(f'  Status: Active')
        self.stdout.write(f'\nTo start the worker, run: uv run python manage.py qcluster')

