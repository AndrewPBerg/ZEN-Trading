"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Share2, Star, Moon, Sun, TrendingUp, Sparkles, Calendar } from "lucide-react"

// Mock horoscope data for different zodiac signs
const horoscopeData = {
  Aries: {
    symbol: "♈",
    element: "Fire",
    dailyInsight:
      "Mars energizes your trading instincts today, Aries. Bold moves in technology sectors align with your pioneering spirit. The cosmic winds favor decisive action over hesitation.",
    marketPrediction:
      "Fire energy burns bright in innovation stocks. Your natural leadership draws you toward companies breaking new ground.",
    luckyNumbers: [3, 9, 21],
    alignedStocks: [
      {
        ticker: "TSLA",
        name: "Tesla Inc.",
        alignment: 94,
        reason: "Revolutionary electric innovation matches your pioneering energy",
      },
      {
        ticker: "NVDA",
        name: "NVIDIA Corp.",
        alignment: 89,
        reason: "Cutting-edge AI technology resonates with your bold vision",
      },
      {
        ticker: "AAPL",
        name: "Apple Inc.",
        alignment: 85,
        reason: "Market leadership aligns with your natural commanding presence",
      },
    ],
    cosmicAdvice: "Trust your instincts today - the universe rewards swift, confident decisions.",
    vibeScore: 92,
  },
  Leo: {
    symbol: "♌",
    element: "Fire",
    dailyInsight:
      "The Sun illuminates golden opportunities in luxury and entertainment sectors, Leo. Your magnetic presence attracts prosperity through creative investments.",
    marketPrediction:
      "Solar energy highlights premium brands and creative industries. Your royal taste guides you toward quality investments.",
    luckyNumbers: [1, 8, 19],
    alignedStocks: [
      {
        ticker: "AAPL",
        name: "Apple Inc.",
        alignment: 96,
        reason: "Premium brand excellence matches your refined taste",
      },
      {
        ticker: "LVMH",
        name: "LVMH Group",
        alignment: 91,
        reason: "Luxury market leadership resonates with your regal nature",
      },
      {
        ticker: "DIS",
        name: "Disney Co.",
        alignment: 87,
        reason: "Creative entertainment empire aligns with your artistic soul",
      },
    ],
    cosmicAdvice: "Shine bright in your investment choices - quality over quantity brings royal returns.",
    vibeScore: 96,
  },
  Scorpio: {
    symbol: "♏",
    element: "Water",
    dailyInsight:
      "Pluto's transformative power reveals hidden gems in emerging markets, Scorpio. Your intuitive depth uncovers what others miss in the financial depths.",
    marketPrediction:
      "Water energy flows toward transformative technologies and mysterious opportunities. Trust your psychic trading instincts.",
    luckyNumbers: [4, 13, 22],
    alignedStocks: [
      {
        ticker: "PLTR",
        name: "Palantir Technologies",
        alignment: 93,
        reason: "Data mysteries and hidden insights match your investigative nature",
      },
      {
        ticker: "COIN",
        name: "Coinbase Global",
        alignment: 88,
        reason: "Cryptocurrency transformation aligns with your revolutionary spirit",
      },
      {
        ticker: "RBLX",
        name: "Roblox Corp.",
        alignment: 84,
        reason: "Virtual world creation resonates with your depth of imagination",
      },
    ],
    cosmicAdvice: "Dive deep into research today - your intuition reveals profitable secrets.",
    vibeScore: 89,
  },
}

export default function HoroscopePage() {
  const [selectedSign, setSelectedSign] = useState<keyof typeof horoscopeData>("Leo")
  const [isSharing, setIsSharing] = useState(false)

  const currentHoroscope = horoscopeData[selectedSign]
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handleShare = async () => {
    setIsSharing(true)
    // Simulate sharing
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSharing(false)
  }

  const getVibeColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 80) return "text-yellow-500"
    return "text-orange-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-20 pb-8">
      {/* Cosmic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-8 w-1 h-1 bg-accent rounded-full animate-pulse" />
        <div className="absolute top-40 right-12 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-primary rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-20 right-8 w-2 h-2 bg-accent rounded-full animate-pulse delay-700" />
        <div className="absolute top-60 left-1/2 w-1 h-1 bg-secondary rounded-full animate-pulse delay-300" />
      </div>

      <div className="relative z-10 max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center pt-8 pb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">{currentDate}</p>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Daily Cosmic Forecast
          </h1>
          <p className="text-sm text-muted-foreground">Your personalized astro-trading guidance</p>
        </div>

        {/* Zodiac Sign Selector */}
        <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
          <div className="flex items-center justify-center gap-4">
            {Object.entries(horoscopeData).map(([sign, data]) => (
              <button
                key={sign}
                onClick={() => setSelectedSign(sign as keyof typeof horoscopeData)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                  selectedSign === sign
                    ? "bg-gradient-to-br from-primary to-secondary text-white shadow-lg scale-110"
                    : "bg-background/50 hover:bg-primary/10 hover:scale-105"
                }`}
              >
                {data.symbol}
              </button>
            ))}
          </div>
        </Card>

        {/* Main Horoscope Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30 backdrop-blur-sm">
          <div className="space-y-4">
            {/* Sign Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xl">
                  {currentHoroscope.symbol}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selectedSign}</h2>
                  <Badge variant="outline" className="text-xs">
                    {currentHoroscope.element} Element
                  </Badge>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getVibeColor(currentHoroscope.vibeScore)}`}>
                  {currentHoroscope.vibeScore}%
                </div>
                <p className="text-xs text-muted-foreground">Cosmic Vibe</p>
              </div>
            </div>

            {/* Daily Insight */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-accent" />
                <h3 className="font-semibold text-foreground">Today's Cosmic Insight</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed bg-background/50 rounded-lg p-3">
                {currentHoroscope.dailyInsight}
              </p>
            </div>

            {/* Market Prediction */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <h3 className="font-semibold text-foreground">Market Alignment</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed bg-background/50 rounded-lg p-3">
                {currentHoroscope.marketPrediction}
              </p>
            </div>

            {/* Lucky Numbers */}
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-accent" fill="currentColor" />
              <span className="text-sm font-medium text-foreground">Lucky Numbers:</span>
              <div className="flex gap-2">
                {currentHoroscope.luckyNumbers.map((num) => (
                  <span
                    key={num}
                    className="w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    {num}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Aligned Stocks */}
        <Card className="p-4 bg-card/80 backdrop-blur-sm border-secondary/20">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-secondary" />
              <h3 className="font-semibold text-foreground">Cosmically Aligned Stocks</h3>
            </div>

            <div className="space-y-3">
              {currentHoroscope.alignedStocks.map((stock, index) => (
                <div
                  key={stock.ticker}
                  className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground">{stock.ticker}</h4>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-accent" fill="currentColor" />
                        <span className="text-xs font-medium text-accent">{stock.alignment}%</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{stock.name}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{stock.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Cosmic Advice */}
        <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
          <div className="flex items-start gap-3">
            <Moon className="w-5 h-5 text-accent mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Cosmic Advice</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{currentHoroscope.cosmicAdvice}</p>
            </div>
          </div>
        </Card>

        {/* Share Button */}
        <Button
          onClick={handleShare}
          disabled={isSharing}
          className="w-full bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 text-white font-semibold py-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          {isSharing ? (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              Sharing cosmic wisdom...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Share2 className="w-4 h-4" />
              Share Your Cosmic Forecast
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
