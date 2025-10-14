"""
Simple yfinance helper module for ZEN Trading
Functions designed for simplicity and reliability
"""
import yfinance as yf
from datetime import datetime, timedelta
import pytz


def is_market_open():
    """
    Check if US stock market is currently open
    
    Returns:
        bool: True if market is in REGULAR trading hours, False otherwise
    """
    stock = yf.Ticker("SPY")
    market_state = stock.info.get('marketState')
    return market_state == 'REGULAR'


def get_ticker_price(ticker):
    """
    Get current price information for a ticker
    
    Args:
        ticker (str): Stock ticker symbol (e.g., 'AAPL')
        
    Returns:
        dict: Dictionary containing price information
    """
    stock = yf.Ticker(ticker)
    info = stock.info
    
    # Get the most appropriate current price
    current_price = (
        info.get('currentPrice') or 
        info.get('regularMarketPrice') or 
        info.get('previousClose')
    )
    
    return {
        'ticker': ticker,
        'current_price': current_price,
        'previous_close': info.get('previousClose'),
        'open': info.get('regularMarketOpen') or info.get('open'),
        'day_high': info.get('regularMarketDayHigh') or info.get('dayHigh'),
        'day_low': info.get('regularMarketDayLow') or info.get('dayLow'),
        'volume': info.get('regularMarketVolume') or info.get('volume'),
        'market_cap': info.get('marketCap'),
        'company_name': info.get('longName') or info.get('shortName'),
        'market_state': info.get('marketState'),
        'pre_market_price': info.get('preMarketPrice'),
        'post_market_price': info.get('postMarketPrice')
    }


def get_ticker_intraday(ticker, period="1d", interval="1m"):
    """
    Get intraday (minute-by-minute) data for a ticker
    
    Args:
        ticker (str): Stock ticker symbol (e.g., 'AAPL')
        period (str): Data period - '1d', '5d', '1mo', etc. (default: '1d')
        interval (str): Data interval - '1m', '2m', '5m', '15m', '30m', '60m', '1h' (default: '1m')
        
    Returns:
        pandas.DataFrame: Historical data with columns [Open, High, Low, Close, Volume]
        
    Note:
        1-minute data is only available for the last 7 days
    """
    stock = yf.Ticker(ticker)
    hist = stock.history(period=period, interval=interval)
    return hist


def get_next_market_open():
    """
    Calculate the next market open time (9:30 AM ET on next trading day)
    
    Returns:
        str: Next market open time formatted as 'YYYY-MM-DD HH:MM:SS TZ'
    """
    eastern = pytz.timezone('US/Eastern')
    now = datetime.now(eastern)
    
    # Check if today is a weekday and market hasn't opened yet
    if now.weekday() < 5 and now.hour < 9 or (now.hour == 9 and now.minute < 30):
        # Market opens today
        next_open = now.replace(hour=9, minute=30, second=0, microsecond=0)
    else:
        # Start with tomorrow
        next_day = now + timedelta(days=1)
        
        # Skip weekends (5=Saturday, 6=Sunday)
        while next_day.weekday() >= 5:
            next_day += timedelta(days=1)
        
        # Set to market open time (9:30 AM)
        next_open = next_day.replace(hour=9, minute=30, second=0, microsecond=0)
    
    return next_open.strftime("%Y-%m-%d %H:%M:%S %Z")

