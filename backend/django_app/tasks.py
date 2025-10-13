"""
Background tasks for ZEN Trading
Uses Django-Q2 for scheduling and execution
"""
import logging
import asyncio
from datetime import date
from django_app.models import Stock, DailyHoroscope
from django_app.utils.yfinance_module import is_market_open, get_ticker_price, get_next_market_open
from django_app.utils.horoscope_generator import (
    scrape_daily_horoscopes,
    generate_financial_horoscope,
    get_date_formatted,
    get_investing_style_display
)

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


def generate_single_horoscope(zodiac_sign, investing_style):
    """
    Generate a single horoscope for a specific zodiac sign and investing style.
    Used when a user completes onboarding to ensure they have a horoscope immediately.
    
    Args:
        zodiac_sign (str): Zodiac sign (e.g., "Aries")
        investing_style (str): Investing style key (e.g., "casual", "balanced", etc.)
    
    Returns:
        DailyHoroscope: The created or existing horoscope object
    """
    today = date.today()
    
    # Check if horoscope already exists for this combination
    existing_horoscope = DailyHoroscope.objects.filter(
        zodiac_sign=zodiac_sign,
        investing_style=investing_style,
        date=today
    ).first()
    
    if existing_horoscope:
        logger.info(f"Horoscope already exists for {zodiac_sign} - {investing_style} on {today}")
        return existing_horoscope
    
    logger.info(f"Generating horoscope for {zodiac_sign} - {investing_style}...")
    
    try:
        # Scrape horoscopes
        daily_horoscopes = asyncio.run(scrape_daily_horoscopes())
        
        # Get formatted date for AI prompt
        today_formatted = get_date_formatted()
        
        # Get display name for investing style
        style_display = get_investing_style_display(investing_style)
        
        # Generate financial horoscope
        horoscope_text = generate_financial_horoscope(
            daily_horoscopes=daily_horoscopes,
            today=today_formatted,
            zodiac_sign=zodiac_sign,
            investing_style=style_display
        )
        
        # Save to database
        horoscope = DailyHoroscope.objects.create(
            zodiac_sign=zodiac_sign,
            investing_style=investing_style,
            date=today,
            horoscope_text=horoscope_text
        )
        
        logger.info(f"Successfully generated horoscope for {zodiac_sign} - {investing_style}")
        return horoscope
        
    except Exception as e:
        logger.error(f"Error generating horoscope for {zodiac_sign} - {investing_style}: {str(e)}")
        raise


def generate_daily_horoscopes():
    """
    Generate daily horoscopes for all zodiac signs and investing styles.
    
    This task:
    1. Scrapes horoscopes once from astrology.com
    2. Generates AI horoscopes for all 12 zodiac signs × 4 investing styles (48 total)
    3. Saves them to the database
    4. Deletes old horoscopes (no archiving)
    
    Scheduled to run daily at 12:00 AM EST via Django-Q2.
    Also includes backfill logic to generate horoscopes if none exist for today.
    """
    today = date.today()
    
    # Check if horoscopes already exist for today
    existing_count = DailyHoroscope.objects.filter(date=today).count()
    
    if existing_count > 0:
        logger.info(f"Horoscopes already exist for {today} ({existing_count} entries). Skipping generation.")
        return
    
    logger.info(f"Generating daily horoscopes for {today}...")
    
    try:
        # Step 1: Scrape horoscopes once (all 12 signs)
        logger.info("Scraping daily horoscopes from astrology.com...")
        daily_horoscopes = asyncio.run(scrape_daily_horoscopes())
        logger.info(f"Successfully scraped horoscopes for {len(daily_horoscopes)} zodiac signs")
        
        # Step 2: Get formatted date for AI prompt
        today_formatted = get_date_formatted()
        
        # Step 3: Generate AI horoscopes for all combinations
        zodiac_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        
        investing_styles = ['casual', 'balanced', 'profit-seeking', 'playful']
        
        generated_count = 0
        error_count = 0
        
        for zodiac_sign in zodiac_signs:
            for style_key in investing_styles:
                try:
                    # Get display name for investing style
                    style_display = get_investing_style_display(style_key)
                    
                    # Generate financial horoscope
                    horoscope_text = generate_financial_horoscope(
                        daily_horoscopes=daily_horoscopes,
                        today=today_formatted,
                        zodiac_sign=zodiac_sign,
                        investing_style=style_display
                    )
                    
                    # Save to database
                    DailyHoroscope.objects.create(
                        zodiac_sign=zodiac_sign,
                        investing_style=style_key,
                        date=today,
                        horoscope_text=horoscope_text
                    )
                    
                    generated_count += 1
                    logger.debug(f"Generated horoscope for {zodiac_sign} - {style_key}")
                    
                except Exception as e:
                    error_count += 1
                    logger.error(f"Error generating horoscope for {zodiac_sign} - {style_key}: {str(e)}")
        
        logger.info(f"Horoscope generation complete. Generated: {generated_count}, Errors: {error_count}")
        
        # Step 4: Delete old horoscopes (keep only today's)
        deleted_count, _ = DailyHoroscope.objects.filter(date__lt=today).delete()
        if deleted_count > 0:
            logger.info(f"Deleted {deleted_count} old horoscope(s)")
        
    except Exception as e:
        logger.error(f"Fatal error in horoscope generation: {str(e)}")
        raise

