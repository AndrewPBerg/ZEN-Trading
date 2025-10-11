"""
Management command to fetch initial prices for stocks with missing price data
Uses yfinance to get the last known close price
"""
from django.core.management.base import BaseCommand
from django_app.models import Stock
from django_app.utils.yfinance_module import get_ticker_price


class Command(BaseCommand):
    help = 'Fetch initial prices for stocks with missing price data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force fetch prices even if they already exist',
        )

    def handle(self, *args, **options):
        force = options.get('force', False)
        
        # Get stocks that need prices
        if force:
            stocks = Stock.objects.all()
            self.stdout.write(f'Force mode: Fetching prices for all {stocks.count()} stocks...')
        else:
            stocks = Stock.objects.filter(previous_close__isnull=True)
            self.stdout.write(f'Fetching prices for {stocks.count()} stocks with missing data...')
        
        if stocks.count() == 0:
            self.stdout.write(self.style.SUCCESS('All stocks already have price data!'))
            return
        
        success_count = 0
        error_count = 0
        
        for stock in stocks:
            try:
                self.stdout.write(f'  Fetching {stock.ticker}...', ending='')
                
                # Fetch price data from yfinance
                price_data = get_ticker_price(stock.ticker)
                
                # Update stock with price information
                stock.current_price = price_data.get('current_price')
                stock.previous_close = price_data.get('previous_close')
                stock.market_state = price_data.get('market_state')
                
                # Also update company name if it's more accurate from yfinance
                if price_data.get('company_name') and not stock.company_name:
                    stock.company_name = price_data.get('company_name')
                
                stock.save()
                
                success_count += 1
                self.stdout.write(self.style.SUCCESS(f' ${stock.previous_close}'))
                
            except Exception as e:
                error_count += 1
                self.stdout.write(self.style.ERROR(f' FAILED: {str(e)}'))
        
        self.stdout.write('\n' + '=' * 60)
        self.stdout.write(self.style.SUCCESS(
            f'Complete! Success: {success_count}, Errors: {error_count}'
        ))
        
        if error_count > 0:
            self.stdout.write(self.style.WARNING(
                f'\nNote: {error_count} stock(s) failed to fetch. They may be invalid tickers.'
            ))

