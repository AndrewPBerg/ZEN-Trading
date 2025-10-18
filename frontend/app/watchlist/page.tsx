"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ProtectedRoute } from "@/components/protected-route"
import { BuyStockModal } from "@/components/buy-stock-modal"
import { AlignmentInfoModal } from "@/components/alignment-info-modal"
import { useAuth } from "@/hooks/use-auth"
import {
  Star,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Trash2,
  ArrowRightLeft,
  ExternalLink,
  Heart,
  Sparkles,
  Info,
} from "lucide-react"
import {
  getWatchlistWithDetails,
  addToWatchlist,
  addToDislikeList,
  removeFromWatchlist,
  removeFromDislikeList,
  type StockPreferenceWithDetails,
  type Stock,
} from "@/lib/api/stocks"
import { getPortfolioSummary, type PortfolioSummary } from "@/lib/api/holdings"
import { toast } from "sonner"
import { XIcon } from "lucide-react"
// Element colors
const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Fire: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  Earth: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  Air: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  Water: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
}

// Zodiac sign emojis
const ZODIAC_EMOJIS: Record<string, string> = {
  Aries: "♈",
  Taurus: "♉",
  Gemini: "♊",
  Cancer: "♋",
  Leo: "♌",
  Virgo: "♍",
  Libra: "♎",
  Scorpio: "♏",
  Sagittarius: "♐",
  Capricorn: "♑",
  Aquarius: "♒",
  Pisces: "♓",
}

function WatchlistPageContent() {
  const router = useRouter()
  const { user } = useAuth()
  const [watchlist, setWatchlist] = useState<StockPreferenceWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<{ ticker: string; stock?: Stock } | null>(null)
  const [userSign, setUserSign] = useState<string>("")
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)

  // Set user sign when user data is available
  useEffect(() => {
    if (user?.profile?.zodiac_sign) {
      setUserSign(user.profile.zodiac_sign)
      console.log("User zodiac sign:", user.profile.zodiac_sign)
    }
  }, [user])

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    try {
      const portfolioData = await getPortfolioSummary()
      setPortfolio(portfolioData)
    } catch (err) {
      console.error("Failed to fetch portfolio:", err)
      // Don't show error toast for portfolio fetch failure, it's not critical
    }
  }

  // Fetch data
  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getWatchlistWithDetails()
      console.log("Fetched watchlist data:", data)
      setWatchlist(data.watchlist)
      // Note: We don't store disliked data since we're not displaying it
      
      // Also fetch portfolio data for cosmic impact calculations
      await fetchPortfolio()
    } catch (err) {
      console.error("Failed to fetch watchlist:", err)
      setError(err instanceof Error ? err.message : "Failed to load watchlist")
      toast.error("Failed to load watchlist")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])


  // Move stock to watchlist
  const moveToWatchlist = async (ticker: string) => {
    try {
      await addToWatchlist(ticker)
      toast.success(`Moved ${ticker} to liked stocks`)
      await fetchData()
    } catch (err) {
      console.error("Failed to move to watchlist:", err)
      toast.error("Failed to move stock")
    }
  }

  // Move stock to dislike list
  const moveToDisliked = async (ticker: string) => {
    try {
      await addToDislikeList(ticker)
      toast.success(`Moved ${ticker} to disliked stocks`)
      await fetchData()
    } catch (err) {
      console.error("Failed to move to disliked:", err)
      toast.error("Failed to move stock")
    }
  }

  // Remove stock entirely
  const removeStock = async (ticker: string, preferenceType: "watchlist" | "dislike") => {
    try {
      if (preferenceType === "watchlist") {
        await removeFromWatchlist(ticker)
      } else {
        await removeFromDislikeList(ticker)
      }
      toast.success(`Removed ${ticker}`)
      await fetchData()
    } catch (err) {
      console.error("Failed to remove stock:", err)
      toast.error("Failed to remove stock")
    }
  }

  // Open buy modal
  const openBuyModal = (ticker: string, stock?: Stock) => {
    setSelectedStock({ ticker, stock })
    setBuyModalOpen(true)
  }

  // Close buy modal
  const closeBuyModal = () => {
    setBuyModalOpen(false)
    setSelectedStock(null)
  }

  // Handle successful purchase
  const handlePurchaseSuccess = async () => {
    if (!selectedStock) return

    try {
      // Remove from watchlist
      await removeFromWatchlist(selectedStock.ticker)
      
      // Show success toast
      toast.success(
        `Successfully purchased ${selectedStock.ticker}! Stock removed from watchlist.`,
        { duration: 5000 }
      )
      
      // Refresh data
      await fetchData()
    } catch (err) {
      console.error("Failed to remove from watchlist after purchase:", err)
      // Still show success for the purchase
      toast.success(`Successfully purchased ${selectedStock.ticker}!`, { duration: 5000 })
      // Refresh data anyway
      await fetchData()
    }
  }

  // Calculate price change
  const getPriceChange = (stock: Stock) => {
    if (!stock.current_price || !stock.previous_close) return null
    const currentPrice =
      typeof stock.current_price === "string" ? parseFloat(stock.current_price) : stock.current_price
    const previousClose =
      typeof stock.previous_close === "string" ? parseFloat(stock.previous_close) : stock.previous_close

    if (isNaN(currentPrice) || isNaN(previousClose)) return null

    const change = currentPrice - previousClose
    const changePercent = (change / previousClose) * 100
    return { change, changePercent }
  }

  // Get element from zodiac
  const getElementFromZodiac = (zodiacSign: string | null): string | null => {
    if (!zodiacSign) return null
    const ZODIAC_ELEMENTS: Record<string, string> = {
      Aries: "Fire",
      Leo: "Fire",
      Sagittarius: "Fire",
      Taurus: "Earth",
      Virgo: "Earth",
      Capricorn: "Earth",
      Gemini: "Air",
      Libra: "Air",
      Aquarius: "Air",
      Cancer: "Water",
      Scorpio: "Water",
      Pisces: "Water",
    }
    return ZODIAC_ELEMENTS[zodiacSign] || null
  }

  // Get alignment score based on match type (matching backend logic)
  const getAlignmentScore = (stock: Stock): number => {
    if (stock.is_same_sign) return 100
    if (stock.match_type === 'positive') return 85
    if (stock.match_type === 'neutral') return 65
    if (stock.match_type === 'negative') return 40
    return 50 // Default
  }

  // Get alignment color
  const getAlignmentColor = (score: number): string => {
    if (score >= 85) return "text-green-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 50) return "text-yellow-500"
    return "text-orange-500"
  }

  // Get match type badge (same as discovery page)
  const getMatchBadge = (stock: Stock) => {
    if (stock.is_same_sign) {
      return (
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
          ✨ Same Sign
        </Badge>
      )
    }
    if (stock.match_type === "positive") {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          ⭐ Positive Match
        </Badge>
      )
    }
    if (stock.match_type === "neutral") {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
          ◯ Neutral Match
        </Badge>
      )
    }
    if (stock.match_type === "negative") {
      return (
        <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
          ⚠ Negative Match
        </Badge>
      )
    }
    return null
  }

  // Render stock card
  const renderStockCard = (item: StockPreferenceWithDetails, preferenceType: "watchlist" | "dislike") => {
    const { stock } = item
    
    // Debug logging to see what data we have
    console.log(`Stock ${stock.ticker} data:`, {
      match_type: stock.match_type,
      is_same_sign: stock.is_same_sign,
      compatibility_score: stock.compatibility_score,
      element: stock.element,
      zodiac_sign: stock.zodiac_sign
    })
    
    const priceChange = getPriceChange(stock)
    const isPositive = priceChange ? priceChange.change >= 0 : false
    const element = getElementFromZodiac(stock.zodiac_sign)

    return (
      <Card
        key={item.id}
        className="p-4 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all"
      >
        <div className="space-y-3">
          {/* Header with ticker and price */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">{stock.ticker}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{stock.company_name}</p>
            </div>
            <div className="text-right">
              {stock.current_price ? (
                <>
                  <p className="text-lg font-bold text-foreground">
                    $
                    {(typeof stock.current_price === "string"
                      ? parseFloat(stock.current_price)
                      : stock.current_price
                    ).toFixed(2)}
                  </p>
                  {priceChange && (
                    <div className={`flex items-center justify-end gap-1 text-xs ${isPositive ? "text-green-400" : "text-red-400"}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>
                        {isPositive ? "+" : ""}
                        {priceChange.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">N/A</p>
              )}
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {getMatchBadge(stock)}
            {stock.zodiac_sign && (
              <Badge variant="outline" className="text-xs">
                {ZODIAC_EMOJIS[stock.zodiac_sign] || ""} {stock.zodiac_sign}
              </Badge>
            )}
            {element && ELEMENT_COLORS[element] && (
              <Badge
                className={`text-xs ${ELEMENT_COLORS[element].bg} ${ELEMENT_COLORS[element].text} ${ELEMENT_COLORS[element].border}`}
              >
                {element}
              </Badge>
            )}
          </div>

          {/* Alignment Score */}
          {(stock.match_type || stock.is_same_sign) && (
            <div className="flex items-center gap-2 py-2 border-t border-border/30">
              <Star className={`w-4 h-4 ${getAlignmentColor(getAlignmentScore(stock))}`} fill="currentColor" />
              <span className={`text-sm font-medium ${getAlignmentColor(getAlignmentScore(stock))}`}>
                {getAlignmentScore(stock)}% Cosmic Alignment
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <Button
              size="sm"
              variant="default"
              onClick={() => openBuyModal(stock.ticker, stock)}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90"
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Buy
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/stock/${stock.ticker}`)}
              className="bg-transparent"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                preferenceType === "watchlist" ? moveToDisliked(stock.ticker) : moveToWatchlist(stock.ticker)
              }
              className="flex-1 bg-transparent text-xs"
            >
              <ArrowRightLeft className="w-3 h-3 mr-1" />
              {preferenceType === "watchlist" ? "Move to Disliked" : "Move to Liked"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => removeStock(stock.ticker, preferenceType)}
              className="bg-transparent text-red-500 border-red-500/30 hover:bg-red-500/10"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Loading state - only show on initial load, not during refreshes
  if (isLoading && watchlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative pt-20 pb-8">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <div className="space-y-4">
            <Skeleton className="h-10 w-48 bg-muted/20" />
            <Skeleton className="h-12 w-full bg-muted/20" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-48 bg-muted/20" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 relative pt-20 pb-8">
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <Card className="p-8 text-center bg-card/80 backdrop-blur-sm">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <XIcon className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Oops!</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchData} size="sm">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    )
  }

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

      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold text-foreground mb-2">Watchlist</h1>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-transparent mb-2"
                    onClick={() => setShowInfoModal(true)}
                  >
                    <Info className="w-4 h-4 text-muted-foreground hover:text-accent transition-colors" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {userSign && `${ZODIAC_EMOJIS[userSign] || ""} ${userSign} | `}
                  Track and manage your cosmic stock selections
                </p>
              </div>
            </div>
            {isLoading && watchlist.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Updating...
              </div>
            )}
          </div>
        </div>


        {/* Liked stocks section */}
        <div className="mb-8 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold text-foreground">Liked Stocks</h2>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              {watchlist.length}
            </Badge>
          </div>

          {watchlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchlist.map((item) => renderStockCard(item, "watchlist"))}
            </div>
          ) : (
            <Card className="p-8 text-center bg-card/50">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">No liked stocks yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Discover stocks aligned with your cosmic energy in the Discovery page
                  </p>
                  <Button
                    onClick={() => router.push("/discovery")}
                    className="bg-gradient-to-r from-primary to-secondary text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Discover Stocks
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

      </div>

      {/* Alignment Info Modal */}
      <AlignmentInfoModal open={showInfoModal} onOpenChange={setShowInfoModal} />

      {/* Buy stock modal */}
      <BuyStockModal
        open={buyModalOpen}
        onClose={closeBuyModal}
        ticker={selectedStock?.ticker || ""}
        stockData={selectedStock?.stock}
        onPurchaseSuccess={handlePurchaseSuccess}
        currentPortfolio={portfolio ? {
          overall_alignment_score: portfolio.overall_alignment_score,
          cosmic_vibe_index: portfolio.cosmic_vibe_index,
          element_distribution: portfolio.element_distribution,
          total_portfolio_value: portfolio.total_portfolio_value,
          cash_balance: portfolio.cash_balance,
          stocks_value: portfolio.stocks_value,
        } : undefined}
        allHoldings={portfolio?.holdings}
      />
    </div>
  )
}

export default function WatchlistPage() {
  return (
    <ProtectedRoute>
      <WatchlistPageContent />
    </ProtectedRoute>
  )
}
