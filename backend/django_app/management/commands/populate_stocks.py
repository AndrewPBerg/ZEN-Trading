"""
Management command to populate Stock model with initial data from stocks.json
"""
import json
from pathlib import Path
from datetime import datetime
from django.core.management.base import BaseCommand
from django.utils import timezone
import pytz
from django_app.models import Stock


class Command(BaseCommand):
    help = 'Populate Stock model with data from stocks.json'

    def handle(self, *args, **options):
        # Construct path to stocks.json
        base_dir = Path(__file__).resolve().parent.parent.parent.parent
        json_path = base_dir / 'data' / 'stocks.json'
        
        if not json_path.exists():
            self.stdout.write(self.style.ERROR(f'stocks.json not found at {json_path}'))
            return
        
        # Load stocks data
        with open(json_path, 'r') as f:
            stocks_data = json.load(f)
        
        self.stdout.write(f'Loading {len(stocks_data)} stocks from stocks.json...')
        
        created_count = 0
        updated_count = 0
        
        for stock_data in stocks_data:
            ticker = stock_data.get('ticker')
            
            if not ticker:
                self.stdout.write(self.style.WARNING(f'Skipping entry without ticker: {stock_data}'))
                continue
            
            # Parse date_founded
            date_founded = None
            if stock_data.get('date_founded'):
                try:
                    # Parse ISO format and make timezone-aware
                    naive_dt = datetime.fromisoformat(stock_data['date_founded'].replace('T00:00:00', ''))
                    # Make timezone-aware using UTC
                    date_founded = timezone.make_aware(naive_dt, pytz.UTC)
                except (ValueError, AttributeError):
                    self.stdout.write(self.style.WARNING(f'Invalid date for {ticker}: {stock_data.get("date_founded")}'))
            
            # Create or update stock
            stock, created = Stock.objects.update_or_create(
                ticker=ticker,
                defaults={
                    'company_name': stock_data.get('name', ''),
                    'description': stock_data.get('description', ''),
                    'date_founded': date_founded,
                    'zodiac_sign': stock_data.get('zodiac_sign', ''),
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'[+] Created {ticker}'))
            else:
                updated_count += 1
                self.stdout.write(f'[*] Updated {ticker}')
        
        self.stdout.write(self.style.SUCCESS(
            f'\nComplete! Created: {created_count}, Updated: {updated_count}'
        ))

