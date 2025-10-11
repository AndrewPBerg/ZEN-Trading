"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PortfolioChart } from "@/components/portfolio-chart"
import { TrendingUp, TrendingDown, Star, Sparkles, Eye, MoreHorizontal } from "lucide-react"

// Mock portfolio data
const portfolioData = {
  totalValue: 12847.32,
  totalChange: 234.56,
  totalChangePercent: 1.86,
  vibeIndex: 78,
  cosmicAlignment: "Strong Ascending",
  holdings: [
    {
      ticker: "AAPL",
      name: "Apple Inc.",
      shares: 15,
      avgPrice: 168.5,
      currentPrice: 175.43,
      value: 2631.45,
      change: 103.95,
      changePercent: 4.11,
      zodiacMatch: "Leo",
      alignment: 92,
      element: "Fire",
      logo: "🍎",
    },
    {
      ticker: "TSLA",
      name: "Tesla Inc.",
      shares: 8,
      avgPrice: 255.2,
      currentPrice: 248.87,
      value: 1990.96,
      change: -50.64,
      changePercent: -2.48,
      zodiacMatch: "Aquarius",
      alignment: 88,
      element: "Air",
      logo: "⚡",
    },
    {
      ticker: "NVDA",
      name: "NVIDIA Corp.",
      shares: 5,
      avgPrice: 398.75,
      currentPrice: 421.13,
      value: 2105.65,
      change: 111.9,
      changePercent: 5.61,
      zodiacMatch: "Gemini",
      alignment: 85,
      element: "Air",
      logo: "🔮",
    },
    {
      ticker: "AMZN",
      name: "Amazon.com Inc.",
      shares: 25,
      avgPrice: 125.3,
      currentPrice: 127.74,
      value: 3193.5,
      change: 61.0,
      changePercent: 1.95,
      zodiacMatch: "Sagittarius",
      alignment: 79,
      element: "Fire",
      logo: "📦",
    },
    {
      ticker: "MSFT",
      name: "Microsoft Corp.",
      shares: 12,
      avgPrice: 365.8,
      currentPrice: 378.85,
      value: 4546.2,
      change: 156.6,
      changePercent: 3.56,
      zodiacMatch: "Virgo",
      alignment: 76,
      element: "Earth",
      logo: "💻",
    },
  ],
}

const elementColors = {
  Fire: "from-red-500/20 to-orange-500/20 border-red-500/30",
  Earth: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  Air: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  Water: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
}

export default function PortfolioPage() {
  const [selectedHolding, setSelectedHolding] = useState<string | null>(null)

  const isPositive = portfolioData.totalChange >= 0
  const averageAlignment = Math.round(
    portfolioData.holdings.reduce((acc, holding) => acc + holding.alignment, 0) / portfolioData.holdings.length,
  )

  const getVibeColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-orange-500"
  }

  const getAlignmentColor = (alignment: number) => {
    if (alignment >= 85) return "text-green-500"
    if (alignment >= 75) return "text-yellow-500"
    return "text-orange-500"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-20 pb-8">
      {/* Cosmic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-8 w-1 h-1 bg-accent rounded-full animate-pulse" />
        <div className="absolute top-40 right-12 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-primary rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-20 right-8 w-2 h-2 bg-accent rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50 p-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-foreground">Cosmic Portfolio</h1>
            <p className="text-sm text-muted-foreground">Your stellar investment journey</p>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Portfolio Summary */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">${portfolioData.totalValue.toLocaleString()}</div>
                <div
                  className={`flex items-center justify-center gap-1 mt-1 ${isPositive ? "text-green-500" : "text-red-500"}`}
                >
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-medium">
                    {isPositive ? "+" : ""}${Math.abs(portfolioData.totalChange).toFixed(2)} ({isPositive ? "+" : ""}
                    {portfolioData.totalChangePercent.toFixed(2)}%)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total Portfolio Value</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Cosmic Vibe Index</span>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-accent" fill="currentColor" />
                    <span className={`font-bold ${getVibeColor(portfolioData.vibeIndex)}`}>
                      {portfolioData.vibeIndex}%
                    </span>
                  </div>
                </div>
                <Progress value={portfolioData.vibeIndex} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">{portfolioData.cosmicAlignment}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-sm text-muted-foreground">Average Alignment</span>
                <span className={`font-medium ${getAlignmentColor(averageAlignment)}`}>{averageAlignment}%</span>
              </div>
            </div>
          </Card>

          {/* Performance Chart */}
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
            <PortfolioChart />
          </Card>

          {/* Holdings List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Your Holdings</h2>
              <Badge variant="outline" className="text-xs">
                {portfolioData.holdings.length} Positions
              </Badge>
            </div>

            {portfolioData.holdings.map((holding) => {
              const isHoldingPositive = holding.change >= 0
              const isSelected = selectedHolding === holding.ticker

              return (
                <Card
                  key={holding.ticker}
                  className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
                    isSelected ? "ring-2 ring-primary shadow-lg scale-[1.02]" : ""
                  } bg-gradient-to-br ${elementColors[holding.element as keyof typeof elementColors]} backdrop-blur-sm`}
                  onClick={() => setSelectedHolding(isSelected ? null : holding.ticker)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-background/80 rounded-full flex items-center justify-center text-lg">
                          {holding.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-foreground">{holding.ticker}</h3>
                            <Badge variant="outline" className="text-xs px-2 py-0">
                              {holding.zodiacMatch}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{holding.shares} shares</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-bold text-foreground">${holding.value.toLocaleString()}</p>
                        <div
                          className={`flex items-center gap-1 text-xs ${isHoldingPositive ? "text-green-500" : "text-red-500"}`}
                        >
                          {isHoldingPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>
                            {isHoldingPositive ? "+" : ""}${Math.abs(holding.change).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className={`w-4 h-4 ${getAlignmentColor(holding.alignment)}`} fill="currentColor" />
                        <span className={`text-sm font-medium ${getAlignmentColor(holding.alignment)}`}>
                          {holding.alignment}% Aligned
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {holding.element}
                      </Badge>
                    </div>

                    {isSelected && (
                      <div className="pt-3 border-t border-border/50 space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-muted-foreground">Avg Price</p>
                            <p className="font-medium text-foreground">${holding.avgPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Current Price</p>
                            <p className="font-medium text-foreground">${holding.currentPrice.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <Eye className="w-3 h-3 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                            <MoreHorizontal className="w-3 h-3 mr-1" />
                            Actions
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Cosmic Insights */}
          <Card className="p-4 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Cosmic Portfolio Insight</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your portfolio radiates strong fire and air energy, indicating a balance between innovation and
                  stability. The {portfolioData.vibeIndex}% alignment suggests the stars favor your current holdings.
                  Consider adding earth element stocks for grounding.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
