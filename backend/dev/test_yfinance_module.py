"""
Demo script for yfinance_module.py
Shows how to use the simple helper functions
"""
from yfinance_module import (
    is_market_open,
    get_ticker_price,
    get_ticker_intraday,
    get_next_market_open
)


def main():
    print("="*80)
    print("YFINANCE MODULE DEMO")
    print("="*80)
    
    # 1. Check if market is open
    print("\n1. Is Market Open?")
    print("-" * 80)
    market_open = is_market_open()
    print(f"Market Open: {market_open}")
    if market_open:
        print("🟢 Market is currently in REGULAR trading hours")
    else:
        print("🔴 Market is currently closed")
    
    # 2. Get ticker price
    print("\n2. Get Ticker Price (AAPL)")
    print("-" * 80)
    price_info = get_ticker_price("AAPL")
    print(f"Ticker: {price_info['ticker']}")
    print(f"Company: {price_info['company_name']}")
    print(f"Current Price: ${price_info['current_price']:.2f}" if price_info['current_price'] else "Current Price: N/A")
    print(f"Previous Close: ${price_info['previous_close']:.2f}" if price_info['previous_close'] else "Previous Close: N/A")
    print(f"Day High: ${price_info['day_high']:.2f}" if price_info['day_high'] else "Day High: N/A")
    print(f"Day Low: ${price_info['day_low']:.2f}" if price_info['day_low'] else "Day Low: N/A")
    print(f"Volume: {price_info['volume']:,}" if price_info['volume'] else "Volume: N/A")
    print(f"Market State: {price_info['market_state']}")
    
    # 3. Get intraday data
    print("\n3. Get Intraday Data (TSLA - 1 day, 5 min intervals)")
    print("-" * 80)
    df = get_ticker_intraday("TSLA", period="1d", interval="5m")
    if not df.empty:
        print(f"Total data points: {len(df)}")
        print(f"\nFirst 5 rows:")
        print(df.head())
        print(f"\nLast 5 rows:")
        print(df.tail())
    else:
        print("No data available")
    
    # 4. Get next market open
    print("\n4. Next Market Open")
    print("-" * 80)
    next_open = get_next_market_open()
    print(f"Next Market Open: {next_open}")
    
    print("\n" + "="*80)
    print("DEMO COMPLETE")
    print("="*80)


if __name__ == "__main__":
    main()

