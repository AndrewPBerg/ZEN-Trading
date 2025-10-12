#!/usr/bin/env python
"""
Startup script for ZEN Trading backend in Docker
Orchestrates database setup, stock population, qcluster worker, and gunicorn server
"""
import os
import sys
import subprocess
import time
import django

# Force UTF-8 encoding for Windows compatibility
if sys.platform == 'win32':
    # Try to set console to UTF-8 mode
    try:
        import ctypes
        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleCP(65001)
        kernel32.SetConsoleOutputCP(65001)
    except:
        pass
    # Also set stdout encoding
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'django_app.settings')
django.setup()

from django.core.management import call_command
from django_app.models import Stock, ZodiacSignMatching

# Color codes for output
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
BLUE = '\033[94m'
RESET = '\033[0m'

# Unicode symbols with ASCII fallbacks for Windows
if sys.platform == 'win32':
    CHECK_MARK = '[OK]'
    X_MARK = '[ERROR]'
else:
    CHECK_MARK = '✓'
    X_MARK = '✗'

def log(message, color=RESET):
    """Print colored log message"""
    print(f"{color}[STARTUP] {message}{RESET}")

def run_command(cmd, description):
    """Run a management command and handle errors"""
    log(f"{description}...", BLUE)
    try:
        call_command(*cmd)
        log(f"{CHECK_MARK} {description} completed", GREEN)
        return True
    except Exception as e:
        log(f"{X_MARK} {description} failed: {str(e)}", RED)
        return False

def check_and_clear_db():
    """Check CLEAR_DB env var and clear database if needed"""
    clear_db = os.environ.get('CLEAR_DB', '').lower() in ('true', '1', 'yes')
    
    if clear_db:
        log("CLEAR_DB is set - clearing database", YELLOW)
        run_command(['clear_db'], 'Clear database')
    else:
        log("CLEAR_DB not set - skipping database clear", BLUE)

def run_migrations():
    """Run Django migrations"""
    run_command(['makemigrations'], 'Make migrations')
    run_command(['migrate'], 'Apply migrations')

def populate_zodiac_matching():
    """Populate zodiac sign matching data if not already populated"""
    try:
        matching_count = ZodiacSignMatching.objects.count()
        log(f"Current zodiac matching records: {matching_count}", BLUE)
        
        # If we have no matching data, populate it
        if matching_count == 0:
            log("No zodiac matching data found - populating...", YELLOW)
            run_command(['populate_zodiac_matching'], 'Populate zodiac matching')
        else:
            log(f"Zodiac matching data already populated ({matching_count} records)", GREEN)
            
    except Exception as e:
        log(f"Error in populate_zodiac_matching: {str(e)}", RED)

def populate_stocks_and_prices():
    """Populate stocks from JSON and fetch initial prices if needed"""
    try:
        stock_count = Stock.objects.count()
        log(f"Current stock count: {stock_count}", BLUE)
        
        # Always run populate_stocks to ensure data is up to date
        log("Running populate_stocks to ensure latest data...", YELLOW)
        run_command(['populate_stocks'], 'Populate stocks')
        
        # Check how many stocks need prices
        stocks_without_prices = Stock.objects.filter(previous_close__isnull=True).count()
        
        if stocks_without_prices > 0:
            log(f"{stocks_without_prices} stocks missing price data", YELLOW)
            
            # Check if market is open
            from django_app.utils.yfinance_module import is_market_open
            
            if is_market_open():
                log("Market is open - prices will be fetched by qcluster soon", GREEN)
            else:
                log("Market is closed - fetching last known prices from yfinance...", YELLOW)
                run_command(['fetch_initial_prices'], 'Fetch initial prices')
        else:
            log("All stocks have price data", GREEN)
            
    except Exception as e:
        log(f"Error in populate_stocks_and_prices: {str(e)}", RED)

def setup_price_updates():
    """Set up Django-Q2 scheduled task for price updates"""
    log("Setting up price update schedule", BLUE)
    run_command(['setup_price_updates'], 'Setup price updates')

def start_qcluster():
    """Start Django-Q2 cluster in background"""
    log("Starting qcluster worker in background...", BLUE)
    
    # Detect if we're running via uv
    is_uv_env = 'VIRTUAL_ENV' in os.environ or os.path.exists('.venv')
    
    # Build qcluster command
    if is_uv_env or sys.executable.endswith('python.exe'):
        # Running locally with uv or regular python
        qcluster_cmd = [sys.executable, 'manage.py', 'qcluster']
    else:
        # Running in Docker
        qcluster_cmd = ['python', 'manage.py', 'qcluster']
    
    # Start qcluster as a subprocess with output redirected to parent
    qcluster_process = subprocess.Popen(
        qcluster_cmd,
        stdout=sys.stdout,
        stderr=sys.stderr,
    )
    
    log(f"{CHECK_MARK} qcluster started with PID {qcluster_process.pid}", GREEN)
    
    # Give it a moment to start
    time.sleep(2)
    
    # Check if it's still running
    poll_result = qcluster_process.poll()
    if poll_result is None:
        log(f"{CHECK_MARK} qcluster is running successfully", GREEN)
    else:
        log(f"{X_MARK} qcluster failed to start (exit code: {poll_result})", RED)
        return None
    
    return qcluster_process

def start_gunicorn():
    """Start Gunicorn server in foreground"""
    log("Starting Gunicorn server...", BLUE)
    
    # Get port from environment or use default
    port = os.environ.get('PORT', '42069')
    workers = os.environ.get('GUNICORN_WORKERS', '3')
    
    # Check if gunicorn is available
    gunicorn_available = True
    try:
        subprocess.run(['gunicorn', '--version'], 
                      stdout=subprocess.DEVNULL, 
                      stderr=subprocess.DEVNULL,
                      check=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        gunicorn_available = False
    
    if gunicorn_available:
        gunicorn_cmd = [
            'gunicorn',
            '--bind', f'0.0.0.0:{port}',
            '--workers', workers,
            '--timeout', '120',
            '--access-logfile', '-',
            '--error-logfile', '-',
            'django_app.wsgi:application'
        ]
        
        log(f"Starting Gunicorn on port {port} with {workers} workers", BLUE)
        
        # Start gunicorn in foreground (blocking)
        try:
            subprocess.run(gunicorn_cmd, check=True)
        except KeyboardInterrupt:
            log("Received interrupt signal", YELLOW)
        except subprocess.CalledProcessError as e:
            log(f"Gunicorn failed: {str(e)}", RED)
            sys.exit(1)
    else:
        # Fallback to Django development server for local development
        log(f"Gunicorn not found - using Django development server on port {port}", YELLOW)
        log("Note: This is not recommended for production!", YELLOW)
        
        try:
            from django.core.management import execute_from_command_line
            execute_from_command_line(['manage.py', 'runserver', f'0.0.0.0:{port}'])
        except KeyboardInterrupt:
            log("Received interrupt signal", YELLOW)

def main():
    """Main startup orchestration"""
    log("=" * 60, BLUE)
    log("ZEN Trading Backend Startup", BLUE)
    log("=" * 60, BLUE)
    
    qcluster_process = None
    
    try:
        # Step 1: Check and clear database if needed
        check_and_clear_db()
        
        # Step 2: Run migrations
        run_migrations()
        
        # Step 3: Populate stocks and fetch prices if needed
        populate_stocks_and_prices()
        
        # Step 4: Populate zodiac sign matching data
        populate_zodiac_matching()
        
        # Step 5: Set up price update schedule
        setup_price_updates()
        
        # Step 6: Start qcluster worker
        qcluster_process = start_qcluster()
        
        if qcluster_process is None:
            log("Failed to start qcluster - exiting", RED)
            sys.exit(1)
        
        # Step 7: Start Gunicorn (blocking)
        log("=" * 60, GREEN)
        log("All services started successfully!", GREEN)
        log("=" * 60, GREEN)
        
        start_gunicorn()
        
    except Exception as e:
        log(f"Startup failed: {str(e)}", RED)
        sys.exit(1)
    finally:
        # Cleanup: terminate qcluster if it's running
        if qcluster_process and qcluster_process.poll() is None:
            log("Stopping qcluster worker...", YELLOW)
            qcluster_process.terminate()
            qcluster_process.wait(timeout=5)
            log(f"{CHECK_MARK} qcluster stopped", GREEN)

if __name__ == '__main__':
    main()

