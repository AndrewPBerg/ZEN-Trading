"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockChart } from "@/components/stock-chart"
import { AlignmentInfoModal } from "@/components/alignment-info-modal"
import { ArrowLeft, Star, TrendingUp, TrendingDown, Plus, ShoppingCart, Share2, Heart, Info, Loader2 } from "lucide-react"
import { getStockByTicker, type Stock } from "@/lib/api/stocks"
import { useRouter } from "next/navigation"

export default function StockDetailPage({ params }: { params: { ticker: string } }) {
  const [activeTab, setActiveTab] = useState("market")
  const [isWatchlisted, setIsWatchlisted] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [stock, setStock] = useState<Stock | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const ticker = params.ticker.toUpperCase()

  useEffect(() => {
    fetchStockData()
  }, [ticker])

  const fetchStockData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await getStockByTicker(ticker)
      setStock(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load stock data'
      setError(errorMessage)
      console.error('Failed to fetch stock:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleWatchlist = () => {
    setIsWatchlisted(!isWatchlisted)
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
  }

  const handleBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !stock) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-foreground mb-2">Failed to load stock</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </div>
    )
  }

  const currentPrice = stock.current_price || 0
  const previousClose = stock.previous_close || currentPrice
  const change = currentPrice - previousClose
  const changePercent = previousClose ? (change / previousClose) * 100 : 0
  const isPositive = change >= 0
  const alignmentScore = stock.compatibility_score ? stock.compatibility_score * 25 : 65 // Convert 1-4 scale to 0-100

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
            <Button variant="ghost" size="sm" className="p-2" onClick={handleBack}>
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
                    {stock.ticker.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground">{stock.ticker}</h1>
                    <p className="text-sm text-muted-foreground">{stock.company_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {stock.zodiac_sign && (
                        <Badge variant="outline" className="text-xs">
                          {stock.zodiac_sign}
                        </Badge>
                      )}
                      {stock.element && (
                        <Badge variant="secondary" className="text-xs">
                          {stock.element}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">${currentPrice.toFixed(2)}</div>
                  <div className={`flex items-center gap-1 ${isPositive ? "text-green-500" : "text-red-500"}`}>
                    {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="text-sm font-medium">
                      {isPositive ? "+" : ""}
                      {change.toFixed(2)} ({isPositive ? "+" : ""}
                      {changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" fill="currentColor" />
                  <span className="text-sm font-medium text-accent">{alignmentScore}% Cosmic Alignment</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-transparent"
                    onClick={() => setShowInfoModal(true)}
                  >
                    <Info className="w-3 h-3 text-muted-foreground hover:text-accent transition-colors" />
                  </Button>
                </div>
                <span className="text-xs text-muted-foreground">{stock.market_state || 'MARKET'}</span>
              </div>
            </div>
          </Card>

          {/* Price Chart */}
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
            <StockChart ticker={stock.ticker} alignmentScore={alignmentScore} />
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
                    <p className="text-xs text-muted-foreground">Current Price</p>
                    <p className="font-semibold text-foreground">${currentPrice.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Previous Close</p>
                    <p className="font-semibold text-foreground">${previousClose.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Market State</p>
                    <p className="font-semibold text-foreground">{stock.market_state || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Alignment</p>
                    <p className="font-semibold text-accent">{alignmentScore}%</p>
                  </div>
                  {stock.zodiac_sign && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Zodiac Sign</p>
                      <p className="font-semibold text-foreground">{stock.zodiac_sign}</p>
                    </div>
                  )}
                  {stock.element && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Element</p>
                      <p className="font-semibold text-foreground">{stock.element}</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="astro" className="space-y-4 mt-4">
              <Card className="p-4 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30">
                <div className="space-y-4">
                  {stock.zodiac_sign && stock.date_founded && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Cosmic Birth Chart</h3>
                      <p className="text-sm text-muted-foreground">
                        Founded {new Date(stock.date_founded).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} 
                        {' - '}
                        {stock.zodiac_sign} energy
                      </p>
                    </div>
                  )}

                  {stock.element && (
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Elemental Energy</h3>
                      <p className="text-sm text-muted-foreground">
                        This company carries {stock.element} element energy, which 
                        {stock.element === 'Fire' && ' drives innovation and bold action.'}
                        {stock.element === 'Earth' && ' provides stability and practical growth.'}
                        {stock.element === 'Air' && ' fosters communication and adaptability.'}
                        {stock.element === 'Water' && ' enhances intuition and emotional depth.'}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Cosmic Alignment</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          alignmentScore >= 80 
                            ? 'bg-green-500/10 text-green-600' 
                            : alignmentScore >= 50 
                            ? 'bg-blue-500/10 text-blue-600' 
                            : 'bg-orange-500/10 text-orange-600'
                        }`}
                      >
                        {alignmentScore >= 80 ? 'High Alignment' : alignmentScore >= 50 ? 'Medium Alignment' : 'Low Alignment'}
                      </Badge>
                      {stock.match_type && (
                        <Badge variant="outline" className="text-xs bg-primary/10 text-primary">
                          {stock.match_type === 'positive' ? 'Positive Match' : stock.match_type === 'neutral' ? 'Neutral Match' : 'Challenging Match'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {stock.description && (
                    <div className="bg-background/50 rounded-lg p-3">
                      <p className="text-sm text-muted-foreground leading-relaxed">{stock.description}</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="news" className="space-y-3 mt-4">
              <Card className="p-4 bg-card/80 backdrop-blur-sm">
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">
                    News feed coming soon. Check back later for cosmic market insights.
                  </p>
                </div>
              </Card>
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

      {/* Alignment Info Modal */}
      <AlignmentInfoModal open={showInfoModal} onOpenChange={setShowInfoModal} />
    </div>
  )
}
