"use client"

import type React from "react"

import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlignmentInfoModal } from "@/components/alignment-info-modal"
import { Star, TrendingUp, TrendingDown, Heart, X, Sparkles, Calendar, Info, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { isDemoMode } from "@/lib/demo-mode"
import { getZodiacMatchedStocks, addToWatchlist, addToDislikeList, type Stock } from "@/lib/api/stocks"
import { getOnboardingStatus } from "@/lib/api/onboarding"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

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

// Element colors
const ELEMENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Fire: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  Earth: { bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
  Air: { bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
  Water: { bg: "bg-cyan-500/20", text: "text-cyan-400", border: "border-cyan-500/30" },
}

function DiscoveryPageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const [isDemo, setIsDemo] = useState(false)
  const [stocks, setStocks] = useState<Stock[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedStocks, setLikedStocks] = useState<string[]>([])
  const [dislikedStocks, setDislikedStocks] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userSign, setUserSign] = useState<string>("")
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null)

  useEffect(() => {
    const initializePage = async () => {
      // Clear demo mode if user has real auth tokens
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('zenTraderTokens')
        if (stored) {
          try {
            const tokens = JSON.parse(stored)
            if (tokens.access) {
              // User has real tokens, clear demo mode
              localStorage.removeItem('zenTraderDemoMode')
              localStorage.removeItem('zenTraderDemoUser')
              localStorage.removeItem('zenTraderDemoProfile')
              localStorage.removeItem('zenTraderDemoHoldings')
              localStorage.removeItem('zenTraderDemoWatchlist')
              localStorage.removeItem('zenTraderDemoDislikeList')
              // Clear the zodiac cache to force fresh data
              localStorage.removeItem('cache_zodiac_matched_stocks')
            }
          } catch (e) {
            console.error('Error checking tokens:', e)
          }
        }
      }
      
      const isDemoModeActive = isDemoMode()
      setIsDemo(isDemoModeActive)
      
      // Check onboarding status for authenticated users
      if (!isDemoModeActive && user) {
        try {
          const onboardingStatus = await getOnboardingStatus()
          setOnboardingCompleted(onboardingStatus.onboarding_completed)
          
          // If onboarding not completed, redirect to onboarding
          if (!onboardingStatus.onboarding_completed) {
            router.push('/onboarding')
            return
          }
        } catch (error) {
          console.error('Failed to check onboarding status:', error)
          // If we can't check onboarding status, assume it's not completed
          router.push('/onboarding')
          return
        }
      } else if (isDemoModeActive) {
        // Demo mode - onboarding is always completed
        setOnboardingCompleted(true)
      }
      
      // Only fetch stocks if onboarding is completed
      if (isDemoModeActive || onboardingCompleted) {
        fetchStocks()
      }
    }
    
    initializePage()
  }, [user, router])

  const fetchStocks = async () => {
    // Don't fetch if onboarding not completed
    if (onboardingCompleted === false) {
      return
    }
    
    setIsLoading(true)
    setError(null)
    try {
      // Force refresh to bypass cache and get fresh data
      const response = await getZodiacMatchedStocks(true)
      setStocks(response.matched_stocks)
      setUserSign(response.user_sign)
      console.log("Fetched stocks:", response.matched_stocks)
    } catch (err) {
      console.error("Failed to fetch stocks:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch stocks")
      toast.error("Failed to load stocks")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDragStart = (clientX: number, clientY: number) => {
    if (isAnimating) return
    setIsDragging(true)
    setStartPos({ x: clientX, y: clientY })
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || isAnimating) return

    const deltaX = clientX - startPos.x
    const deltaY = clientY - startPos.y

    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleDragEnd = () => {
    if (!isDragging || isAnimating) return

    const threshold = 100
    const absX = Math.abs(dragOffset.x)

    if (absX > threshold) {
      if (dragOffset.x > 0) {
        handleLike()
      } else {
        handleDislike()
      }
    } else {
      // Spring back animation
      setDragOffset({ x: 0, y: 0 })
    }

    setIsDragging(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    handleDragEnd()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleDragStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleDragMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  const handleLike = async () => {
    if (isAnimating) return
    setIsAnimating(true)
    setSwipeDirection("right")

    const currentStock = stocks[currentIndex]

    try {
      await addToWatchlist(currentStock.ticker)
      toast.success(`Added ${currentStock.ticker} to watchlist`)
      setLikedStocks((prev) => [...prev, currentStock.ticker])
      
      // Remove the stock from the stocks array so it won't appear again
      setStocks((prev) => prev.filter((_, idx) => idx !== currentIndex))
    } catch (err) {
      console.error("Failed to add to watchlist:", err)
      toast.error("Failed to add to watchlist")
      // Still move to next card even if API fails
      setTimeout(() => {
        nextCard()
      }, 300)
      return
    }

    setTimeout(() => {
      setIsAnimating(false)
      setSwipeDirection(null)
      setDragOffset({ x: 0, y: 0 })
      // Don't increment currentIndex since we removed the item from the array
    }, 300)
  }

  const handleDislike = async () => {
    if (isAnimating) return
    setIsAnimating(true)
    setSwipeDirection("left")

    const currentStock = stocks[currentIndex]

    try {
      await addToDislikeList(currentStock.ticker)
      toast.success(`Added ${currentStock.ticker} to dislike list`)
      setDislikedStocks((prev) => [...prev, currentStock.ticker])
      
      // Remove the stock from the stocks array so it won't appear again
      setStocks((prev) => prev.filter((_, idx) => idx !== currentIndex))
    } catch (err) {
      console.error("Failed to add to dislike list:", err)
      toast.error("Failed to add to dislike list")
      // Still move to next card even if API fails
      setTimeout(() => {
        nextCard()
      }, 300)
      return
    }

    setTimeout(() => {
      setIsAnimating(false)
      setSwipeDirection(null)
      setDragOffset({ x: 0, y: 0 })
      // Don't increment currentIndex since we removed the item from the array
    }, 300)
  }

  const nextCard = () => {
    setCurrentIndex((prev) => prev + 1)
    setIsAnimating(false)
    setSwipeDirection(null)
    setDragOffset({ x: 0, y: 0 })
  }

  const currentStock = stocks[currentIndex]
  const isFinished = currentIndex >= stocks.length

  const rotation = isDragging ? dragOffset.x * 0.1 : 0
  const opacity = isDragging ? Math.max(0.7, 1 - Math.abs(dragOffset.x) * 0.002) : 1
  const scale = isDragging ? Math.max(0.95, 1 - Math.abs(dragOffset.x) * 0.0005) : 1

  // Get match type badge
  const getMatchBadge = (stock: Stock) => {
    if (stock.is_same_sign) {
      return (
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-sm">
          ✨ Same Sign
        </Badge>
      )
    }
    if (stock.match_type === "positive") {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-sm">
          ⭐ Positive Match
        </Badge>
      )
    }
    if (stock.match_type === "neutral") {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-sm">
          ◯ Neutral Match
        </Badge>
      )
    }
    return (
      <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-sm">
        ⚠ Negative Match
      </Badge>
    )
  }

  // Format founding date
  const formatFoundingDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    } catch {
      return "N/A"
    }
  }

  // Calculate price change percentage
  const getPriceChange = (stock: Stock) => {
    if (!stock.current_price || !stock.previous_close) return null
    // Ensure prices are numbers (in case they come as strings from API)
    const currentPrice = typeof stock.current_price === 'string' ? parseFloat(stock.current_price) : stock.current_price
    const previousClose = typeof stock.previous_close === 'string' ? parseFloat(stock.previous_close) : stock.previous_close
    
    if (isNaN(currentPrice) || isNaN(previousClose)) return null
    
    const change = currentPrice - previousClose
    const changePercent = (change / previousClose) * 100
    return { change, changePercent }
  }

  // Show loading while checking onboarding status
  if (onboardingCompleted === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-primary/5 dark:via-background dark:to-secondary/5 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white animate-spin" />
          </div>
          <p className="text-muted-foreground">Checking your cosmic profile...</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden flex flex-col pt-16">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <p className="text-muted-foreground">Loading cosmic matches...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden flex flex-col pt-16">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Oops!</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchStocks} size="sm">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden flex flex-col pt-16">
      {/* Header */}
      <div className="px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">Discovery</h1>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-transparent"
                  onClick={() => setShowInfoModal(true)}
                >
                  <Info className="w-4 h-4 text-muted-foreground hover:text-accent transition-colors" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {userSign && `${ZODIAC_EMOJIS[userSign] || ""} ${userSign} matches`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDemo && (
              <Badge variant="outline" className="bg-accent/10 text-accent border-accent/40 text-xs">
                Demo
              </Badge>
            )}
            <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
              <Star className="w-3 h-3 mr-1" />
              {user?.username || "Trader"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 flex items-center justify-center overflow-hidden">
        {!isFinished && currentStock ? (
          <div className="w-full max-w-lg">
            {/* Stock Card with Swipe Animation */}
            <div className="relative">
              <Card
                className={`p-6 bg-card/90 backdrop-blur-sm border-primary/20 shadow-2xl cursor-grab active:cursor-grabbing select-none transition-all duration-300 ${
                  isAnimating && swipeDirection === "right"
                    ? "transform translate-x-full rotate-12 opacity-0"
                    : isAnimating && swipeDirection === "left"
                      ? "transform -translate-x-full -rotate-12 opacity-0"
                      : ""
                }`}
                style={{
                  transform: !isAnimating
                    ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y * 0.1}px) rotate(${rotation}deg) scale(${scale})`
                    : undefined,
                  opacity: !isAnimating ? opacity : undefined,
                  transition: isDragging ? "none" : "all 0.3s ease-out",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={isDragging ? handleMouseMove : undefined}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Match Badge */}
                <div className="mb-4 flex justify-center">
                  {getMatchBadge(currentStock)}
                </div>

                <div className="text-center mb-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-foreground">{currentStock.ticker}</h2>
                    <Link href={`/stock/${currentStock.ticker}`} passHref>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-accent/20"
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground hover:text-accent transition-colors" />
                      </Button>
                    </Link>
                    {currentStock.element && ELEMENT_COLORS[currentStock.element] && (
                      <Badge
                        className={`text-xs ${ELEMENT_COLORS[currentStock.element].bg} ${ELEMENT_COLORS[currentStock.element].text} ${ELEMENT_COLORS[currentStock.element].border}`}
                      >
                        {currentStock.element}
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-1 text-sm font-medium">{currentStock.company_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentStock.zodiac_sign && `${ZODIAC_EMOJIS[currentStock.zodiac_sign]} ${currentStock.zodiac_sign}`}
                  </p>
                </div>

                {/* Price Section */}
                {currentStock.current_price && (
                  <div className="text-center mb-4 pb-4 border-b border-border/50">
                    <p className="text-2xl font-bold text-foreground">
                      ${(typeof currentStock.current_price === 'string' 
                        ? parseFloat(currentStock.current_price) 
                        : currentStock.current_price).toFixed(2)}
                    </p>
                    {getPriceChange(currentStock) && (
                      <div
                        className={`flex items-center justify-center gap-1 text-sm ${
                          getPriceChange(currentStock)!.change >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {getPriceChange(currentStock)!.change >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {getPriceChange(currentStock)!.change >= 0 ? "+" : ""}
                        {getPriceChange(currentStock)!.changePercent.toFixed(2)}%
                      </div>
                    )}
                  </div>
                )}

                {/* Founding Date */}
                <div className="mb-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Founded: {formatFoundingDate(currentStock.date_founded)}</span>
                </div>

                {/* Description */}
                {currentStock.description && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-5 h-5 text-muted-foreground" />
                      <p className="text-sm font-semibold text-foreground">About</p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {currentStock.description}
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDislike()
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={isAnimating || isDragging}
                    className="w-14 h-14 rounded-full bg-red-500/20 hover:bg-red-500/30 border-red-500/50 text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-110 dark:bg-red-500/30 dark:hover:bg-red-500/40 dark:border-red-500/60"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike()
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    disabled={isAnimating || isDragging}
                    className="w-14 h-14 rounded-full bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-400 hover:text-green-300 transition-all duration-200 hover:scale-110"
                  >
                    <Heart className="w-6 h-6" />
                  </Button>
                </div>
              </Card>

              {isDragging && Math.abs(dragOffset.x) > 50 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`absolute inset-0 rounded-lg transition-opacity duration-150 ${
                      dragOffset.x > 0
                        ? "bg-green-500/20 border-2 border-green-500/50"
                        : "bg-red-500/20 border-2 border-red-500/50"
                    }`}
                    style={{ opacity: Math.min(0.8, Math.abs(dragOffset.x) / 150) }}
                  />
                  <div
                    className={`text-6xl font-bold z-10 ${dragOffset.x > 0 ? "text-green-400" : "text-red-400"}`}
                    style={{
                      opacity: Math.min(1, Math.abs(dragOffset.x) / 100),
                      transform: `rotate(${dragOffset.x > 0 ? "12deg" : "-12deg"})`,
                    }}
                  >
                    {dragOffset.x > 0 ? "❤️" : "✕"}
                  </div>
                </div>
              )}

              {/* Swipe Indicators */}
              {isAnimating && (
                <div
                  className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                    swipeDirection === "right" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  <div
                    className={`text-6xl font-bold opacity-80 transform ${
                      swipeDirection === "right" ? "rotate-12" : "-rotate-12"
                    }`}
                  >
                    {swipeDirection === "right" ? "❤️" : "✕"}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">All Done!</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              You've reviewed all recommendations. Check your liked stocks in your watchlist!
            </p>
            <div className="space-y-1 mb-4">
              <p className="text-xs text-green-400">❤️ Liked: {likedStocks.length} stocks</p>
              <p className="text-xs text-red-400">✕ Passed: {dislikedStocks.length} stocks</p>
            </div>
            <Button
              onClick={() => {
                setCurrentIndex(0)
                setLikedStocks([])
                setDislikedStocks([])
                fetchStocks()
              }}
              size="sm"
            >
              Refresh Stocks
            </Button>
          </div>
        )}
      </div>

      {/* Alignment Info Modal */}
      <AlignmentInfoModal open={showInfoModal} onOpenChange={setShowInfoModal} />
    </div>
  )
}

export default function DiscoveryPage() {
  return (
    <ProtectedRoute>
      <DiscoveryPageContent />
    </ProtectedRoute>
  )
}
