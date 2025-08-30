"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockChart } from "@/components/stock-chart"
import { ArrowLeft, Star, TrendingUp, TrendingDown, Plus, ShoppingCart, Share2, Heart } from "lucide-react"

// Mock stock detail data
const stockDetails = {
  AAPL: {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 175.43,
    change: 2.34,
    changePercent: 1.35,
    logo: "🍎",
    alignment: 92,
    zodiacMatch: "Leo",
    element: "Fire",
    sector: "Technology",
    marketCap: "2.8T",
    peRatio: 28.5,
    dividend: "0.96%",
    volume: "45.2M",
    high52Week: 199.62,
    low52Week: 164.08,
    cosmicProfile: {
      birthChart: "Founded April 1, 1976 - Aries Sun with Leo Rising",
      planetaryInfluence: "Mars drives innovation, Sun illuminates premium positioning",
      elementalEnergy: "Fire energy fuels creative breakthroughs and market leadership",
      cosmicStrengths: ["Innovation Leadership", "Premium Brand Power", "Loyal Customer Base"],
      cosmicChallenges: ["Market Saturation", "Regulatory Pressure", "Competition Intensity"],
      astroNote:
        "Apple's Aries foundation combined with Leo energy creates a perfect storm of innovation and luxury appeal. The company's fire element drives continuous reinvention.",
    },
    news: [
      {
        title: "Apple Unveils Revolutionary AI Features",
        summary: "New machine learning capabilities align with cosmic innovation cycles",
        time: "2 hours ago",
        sentiment: "positive",
      },
      {
        title: "Q4 Earnings Beat Expectations",
        summary: "Strong performance reflects Leo energy in premium market positioning",
        time: "1 day ago",
        sentiment: "positive",
      },
      {
        title: "Supply Chain Optimization Continues",
        summary: "Aries determination overcomes global logistics challenges",
        time: "3 days ago",
        sentiment: "neutral",
      },
    ],
  },
}

export default function StockDetailPage({ params }: { params: { ticker: string } }) {
  const [activeTab, setActiveTab] = useState("market")
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const ticker = params.ticker.toUpperCase()
  const stock = stockDetails[ticker as keyof typeof stockDetails] || stockDetails.AAPL

  const isPositive = stock.change >= 0

  const handleWatchlist = () => {
    setIsWatchlisted(!isWatchlisted)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative">
      {/* Constellation Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
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
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleLike} className="p-2">
                <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button variant="ghost" size="sm" className="p-2">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Stock Header */}
          <Card className="p-6 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-background/80 rounded-full flex items-center justify-center text-2xl">
                    {stock.logo}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">{stock.ticker}</h1>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {stock.zodiacMatch}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {stock.element}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">${stock.price.toFixed(2)}</div>
                  <div className={`flex items-center gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {isPositive ? "+" : ""}
                      {stock.change.toFixed(2)} ({isPositive ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" fill="currentColor" />
                  <span className="text-sm font-medium text-accent">{stock.alignment}% Cosmic Alignment</span>
                </div>
                <span className="text-xs text-muted-foreground">{stock.sector}</span>
              </div>
            </div>
          </Card>

          {/* Price Chart */}
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
            <StockChart ticker={stock.ticker} />
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-card/50">
              <TabsTrigger value="market">Market Data</TabsTrigger>
              <TabsTrigger value="astro">Astro Notes</TabsTrigger>
              <TabsTrigger value="news">News</TabsTrigger>
            </TabsList>

            <TabsContent value="market" className="space-y-4 mt-4">
              <Card className="p-4 bg-card/80 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Market Cap</p>
                    <p className="font-semibold text-foreground">{stock.marketCap}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">P/E Ratio</p>
                    <p className="font-semibold text-foreground">{stock.peRatio}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Dividend Yield</p>
                    <p className="font-semibold text-foreground">{stock.dividend}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Volume</p>
                    <p className="font-semibold text-foreground">{stock.volume}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">52W High</p>
                    <p className="font-semibold text-green-500">${stock.high52Week}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">52W Low</p>
                    <p className="font-semibold text-red-500">${stock.low52Week}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="astro" className="space-y-4 mt-4">
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cosmic Birth Chart</h3>
                    <p className="text-sm text-muted-foreground">{stock.cosmicProfile.birthChart}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Planetary Influence</h3>
                    <p className="text-sm text-muted-foreground">{stock.cosmicProfile.planetaryInfluence}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Elemental Energy</h3>
                    <p className="text-sm text-muted-foreground">{stock.cosmicProfile.elementalEnergy}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cosmic Strengths</h3>
                    <div className="flex flex-wrap gap-2">
                      {stock.cosmicProfile.cosmicStrengths.map((strength) => (
                        <Badge key={strength} variant="outline" className="text-xs bg-green-500/10 text-green-600">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cosmic Challenges</h3>
                    <div className="flex flex-wrap gap-2">
                      {stock.cosmicProfile.cosmicChallenges.map((challenge) => (
                        <Badge key={challenge} variant="outline" className="text-xs bg-orange-500/10 text-orange-600">
                          {challenge}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="bg-background/50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">{stock.cosmicProfile.astroNote}</p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="news" className="space-y-3 mt-4">
              {stock.news.map((article, index) => (
                <Card key={index} className="p-4 bg-card/80 backdrop-blur-sm">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-foreground text-sm leading-tight">{article.title}</h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ml-2 ${
                          article.sentiment === "positive"
                            ? "bg-green-500/10 text-green-600"
                            : article.sentiment === "negative"
                              ? "bg-red-500/10 text-red-600"
                              : "bg-gray-500/10 text-gray-600"
                        }`}
                      >
                        {article.sentiment}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{article.summary}</p>
                    <p className="text-xs text-muted-foreground/70">{article.time}</p>
                  </div>
                </Card>
              ))}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 pb-6">
            <Button
              onClick={handleWatchlist}
              variant="outline"
              className={`flex-1 ${
                isWatchlisted
                  ? "bg-accent/20 text-accent border-accent/30"
                  : "bg-transparent border-primary/30 text-primary hover:bg-primary/10"
              }`}
            >
              <Plus className="w-4 h-4 mr-2" />
              {isWatchlisted ? "In Watchlist" : "Add to Watchlist"}
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Simulated Buy
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
