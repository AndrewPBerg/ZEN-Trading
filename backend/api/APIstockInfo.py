import yfinance as yf

def stockInfo(ticker:str):
    stock = yf.Ticker(ticker)
    info = stock.info


    current_price = info.get("currentPrice")
    previous_close = info.get("previousClose")
    if current_price and previous_close:
        dailyChangePCNT = round((((current_price - previous_close)/ previous_close) * 100), 2)
    else:
        dailyChangePCNT = None

    companyName = info.get("longName")
    currentPrice = current_price
    yearlyMax = info.get("fiftyTwoWeekHigh")
    yearlyMin = info.get("fiftyTwoWeekLow")
    yearlyRange = yearlyMax - yearlyMin
    marketCap = info.get("marketCap")
    PE_Ratio = info.get("trailingPE")
    avgVolume = info.get("averageVolume")
    sector = info.get("sector")

    print("Name: " + companyName)
    print("Current Price: ", currentPrice)
    print("Yearly Max: ", yearlyMax)
    print("Yearly Min: ", yearlyMin)
    print("Yearly Range: ", yearlyRange)
    print("Market Cap: ", marketCap)
    print("PE Ratio: ", PE_Ratio)
    print("Average Volume: ", avgVolume)
    print("Sector: " + sector)
    print("Daily % Chance: ", dailyChangePCNT)


def main():
    stockInfo("TSLA")
    stockInfo("AAPL")

main()





