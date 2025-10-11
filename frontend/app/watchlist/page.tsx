"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ConstellationGrid } from "@/components/constellation-grid"
import { AlertCard } from "@/components/alert-card"
import { Star, Bell, Filter, Plus, TrendingUp, TrendingDown } from "lucide-react"

// Mock watchlist data
const watchlistData = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 175.43,
    change: 2.34,
    changePercent: 1.35,
    alignment: 92,
    zodiacMatch: "Leo",
    element: "Fire",
    logo: "🍎",
    position: { x: 2, y: 1 },
    alertActive: false,
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    price: 248.87,
    change: -5.23,
    changePercent: -2.06,
    alignment: 88,
    zodiacMatch: "Aquarius",
    element: "Air",
    logo: "⚡",
    position: { x: 4, y: 2 },
    alertActive: true,
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    price: 421.13,
    change: 12.45,
    changePercent: 3.04,
    alignment: 85,
    zodiacMatch: "Gemini",
    element: "Air",
    logo: "🔮",
    position: { x: 1, y: 3 },
    alertActive: false,
  },
  {
    ticker: "AMZN",
    name: "Amazon.com Inc.",
    price: 127.74,
    change: 1.87,
    changePercent: 1.48,
    alignment: 79,
    zodiacMatch: "Sagittarius",
    element: "Fire",
    logo: "📦",
    position: { x: 5, y: 1 },
    alertActive: false,
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    price: 378.85,
    change: 4.12,
    changePercent: 1.1,
    alignment: 76,
    zodiacMatch: "Virgo",
    element: "Earth",
    logo: "💻",
    position: { x: 3, y: 4 },
    alertActive: false,
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    price: 138.21,
    change: -2.15,
    changePercent: -1.53,
    alignment: 73,
    zodiacMatch: "Scorpio",
    element: "Water",
    logo: "🔍",
    position: { x: 6, y: 3 },
    alertActive: true,
  },
]

const alerts = [
  {
    id: 1,
    ticker: "TSLA",
    message: "Your aligned stock just surged 8% in after-hours trading!",
    type: "surge" as const,
    time: "5 minutes ago",
    isNew: true,
  },
  {
    id: 2,
    ticker: "GOOGL",
    message: "Cosmic alignment strengthened - now 78% compatible with your vibe",
    type: "alignment" as const,
    time: "2 hours ago",
    isNew: false,
  },
  {
    id: 3,
    ticker: "NVDA",
    message: "Mercury retrograde may affect tech stocks - stay vigilant",
    type: "warning" as const,
    time: "1 day ago",
    isNew: false,
  },
]

export default function WatchlistPage() {
  const [selectedStock, setSelectedStock] = useState<string | null>(null)
  const [showAlerts, setShowAlerts] = useState(true)

  const activeAlerts = alerts.filter((alert) => alert.isNew)
  const totalValue = watchlistData.reduce((acc, stock) => acc + stock.price, 0)
  const averageAlignment = Math.round(
    watchlistData.reduce((acc, stock) => acc + stock.alignment, 0) / watchlistData.length,
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative pt-20 pb-8">
      {/* Cosmic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-8 w-1 h-1 bg-accent rounded-full animate-pulse" />
        <div className="absolute top-40 right-12 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-primary rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-20 right-8 w-2 h-2 bg-accent rounded-full animate-pulse delay-700" />
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-secondary rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-60 right-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-pulse delay-900" />
      </div>

      <div className="relative z-10 max-w-md mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">Star Tracker</h1>
              <p className="text-sm text-muted-foreground">Your cosmic watchlist constellation</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAlerts(!showAlerts)} className="relative p-2">
                <Bell className="w-4 h-4" />
                {activeAlerts.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{activeAlerts.length}</span>
                  </div>
                )}
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Alerts */}
          {showAlerts && activeAlerts.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Bell className="w-4 h-4 text-accent" />
                Cosmic Alerts
              </h2>
              {activeAlerts.map((alert) => (
                <AlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          )}

          {/* Watchlist Summary */}
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Constellation Status</p>
                <p className="text-xs text-muted-foreground">{watchlistData.length} stars tracked</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-accent" fill="currentColor" />
                  <span className="font-bold text-accent">{averageAlignment}%</span>
                </div>
                <p className="text-xs text-muted-foreground">Avg Alignment</p>
              </div>
            </div>
          </Card>

          {/* Constellation Grid */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Your Constellation</h2>
                <Button size="sm" variant="outline" className="bg-transparent">
                  <Plus className="w-3 h-3 mr-1" />
                  Add Star
                </Button>
              </div>

              <ConstellationGrid
                stocks={watchlistData}
                selectedStock={selectedStock}
                onSelectStock={setSelectedStock}
              />
            </div>
          </Card>

          {/* Selected Stock Details */}
          {selectedStock && (
            <Card className="p-4 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/30">
              {(() => {
                const stock = watchlistData.find((s) => s.ticker === selectedStock)
                if (!stock) return null

                const isPositive = stock.change >= 0

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-background/80 rounded-full flex items-center justify-center text-lg">
                          {stock.logo}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground">{stock.ticker}</h3>
                          <p className="text-xs text-muted-foreground">{stock.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-foreground">${stock.price.toFixed(2)}</p>
                        <div
                          className={`flex items-center gap-1 text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}
                        >
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>
                            {isPositive ? "+" : ""}
                            {stock.changePercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {stock.zodiacMatch}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {stock.element}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-accent" fill="currentColor" />
                        <span className="text-sm font-medium text-accent">{stock.alignment}%</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                        View Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 bg-transparent text-red-500 border-red-500/30"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </Card>
          )}

          {/* Empty State */}
          {watchlistData.length === 0 && (
            <Card className="p-8 text-center bg-card/50">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Your constellation awaits</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add stocks to your watchlist to create your personal trading constellation
                  </p>
                  <Button className="bg-gradient-to-r from-primary to-secondary text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Star
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
