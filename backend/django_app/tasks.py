"""
Background tasks for ZEN Trading
Uses Django-Q2 for scheduling and execution
"""
import logging
from django_app.models import Stock
from django_app.utils.yfinance_module import is_market_open, get_ticker_price, get_next_market_open

logger = logging.getLogger(__name__)


def update_stock_prices():
    """
    Update current prices for all stocks in the database.
    Only runs updates if the market is open, otherwise logs next market open time.
    
    This function is scheduled to run every 10 seconds via Django-Q2.
    """
    # Check if market is open
    if not is_market_open():
        next_open = get_next_market_open()
        logger.info(f"Market is closed. Next market open: {next_open}")
        return
    
    logger.info("Market is open. Starting price updates for all stocks...")
    
    # Get all stocks from database
    stocks = Stock.objects.all()
    updated_count = 0
    error_count = 0
    
    for stock in stocks:
        try:
            # Fetch current price data from yfinance
            price_data = get_ticker_price(stock.ticker)
            
            # Update stock model with new data
            stock.current_price = price_data.get('current_price')
            stock.previous_close = price_data.get('previous_close')
            stock.market_state = price_data.get('market_state')
            stock.save()
            
            updated_count += 1
            logger.debug(f"Updated {stock.ticker}: ${stock.current_price}")
            
        except Exception as e:
            error_count += 1
            logger.error(f"Error updating {stock.ticker}: {str(e)}")
    
    logger.info(f"Price update complete. Updated: {updated_count}, Errors: {error_count}")

