"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ProtectedRoute } from "@/components/protected-route"
import { PortfolioChart } from "@/components/portfolio-chart"
import { StockSparkline } from "@/components/stock-sparkline"
import { CompatibilityPieChart } from "@/components/compatibility-pie-chart"
import { CombinedHoldingsChart } from "@/components/combined-holdings-chart"
import { SellStockModal } from "@/components/sell-stock-modal"
import { TrendingUp, TrendingDown, Star, Sparkles, AlertTriangle, Loader2, RefreshCw, Info, ShoppingBag } from "lucide-react"
import { getPortfolioSummary, type PortfolioSummary } from "@/lib/api/holdings"
import { getCurrentUser, type User } from "@/lib/api/auth"
import { isDemoMode, getCompleteDemoUser } from "@/lib/demo-mode"
import { cn } from "@/lib/utils"

const elementColors = {
  Fire: "from-red-500/20 to-orange-500/20 border-red-500/30",
  Earth: "from-green-500/20 to-emerald-500/20 border-green-500/30",
  Air: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  Water: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
}

const elementIcons = {
  Fire: "🔥",
  Earth: "🌍",
  Air: "💨",
  Water: "💧",
}

function PortfolioPageContent() {
  // State for holdings selection
  const [selectedHoldings, setSelectedHoldings] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  
  // Existing state
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingCache, setUsingCache] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [accountStartDate, setAccountStartDate] = useState<string | null>(null)

  // Info modal state
  const [showInfoModal, setShowInfoModal] = useState(false)

  // Sell modal state
  const [sellModalOpen, setSellModalOpen] = useState(false)
  const [selectedHoldingForSale, setSelectedHoldingForSale] = useState<any | null>(null)

  const fetchPortfolio = async () => {
    setLoading(true)
    setError(null)
    setUsingCache(false)
    
    try {
      const data = await getPortfolioSummary()
      setPortfolio(data)
      setLastUpdated(new Date())
      
      // Fetch user data for account start date
      try {
        if (isDemoMode()) {
          const demoUser = getCompleteDemoUser()
          if (demoUser) {
            setUser(demoUser)
            setAccountStartDate(demoUser.profile?.created_at || demoUser.date_joined)
          }
        } else {
          const userData = getCurrentUser()
          if (userData) {
            setUser(userData)
            setAccountStartDate(userData.profile?.created_at || userData.date_joined)
          }
        }
      } catch (userErr) {
        console.error('Failed to fetch user data:', userErr)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load portfolio'
      setError(errorMessage)
      
      // Check if we have cached data
      const cached = localStorage.getItem('zenTraderPortfolioCache')
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached)
          setPortfolio(data)
          setLastUpdated(new Date(timestamp))
          setUsingCache(true)
        } catch (e) {
          console.error('Failed to load cached data:', e)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPortfolio()
  }, [])

  // Handle select all toggle
  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked)
    if (checked && portfolio) {
      const allTickers = new Set(portfolio.holdings.map(h => h.ticker))
      setSelectedHoldings(allTickers)
    } else {
      setSelectedHoldings(new Set())
    }
  }

  // Handle individual holding selection
  const toggleHolding = (ticker: string) => {
    const newSelected = new Set(selectedHoldings)
    if (newSelected.has(ticker)) {
      newSelected.delete(ticker)
    } else {
      newSelected.add(ticker)
    }
    setSelectedHoldings(newSelected)
    
    // Update select all state
    if (portfolio && newSelected.size === portfolio.holdings.length) {
      setSelectAll(true)
    } else {
      setSelectAll(false)
    }
  }

  const getVibeColor = (score: number) => {
    if (score >= 85) return "text-green-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 50) return "text-yellow-500"
    return "text-orange-500"
  }

  const getAlignmentColor = (alignment: number) => {
    if (alignment >= 85) return "text-green-500"
    if (alignment >= 70) return "text-blue-500"
    if (alignment >= 50) return "text-yellow-500"
    return "text-orange-500"
  }

  const getAlignmentPhrase = (score: number) => {
    if (score >= 85) return "Excellent Cosmic Alignment"
    if (score >= 70) return "Strong Ascending"
    if (score >= 50) return "Harmonious Balance"
    return "Challenging Aspects"
  }

  const getMatchTypeColor = (matchType: string) => {
    if (matchType === 'same_sign') return "bg-purple-500/20 text-purple-400 border-purple-500/30"
    if (matchType === 'positive') return "bg-green-500/20 text-green-400 border-green-500/30"
    if (matchType === 'neutral') return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    return "bg-orange-500/20 text-orange-400 border-orange-500/30"
  }

  const formatTimeSince = (date: Date | null) => {
    if (!date) return 'Never'
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    const hours = Math.floor(minutes / 60)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  }

  const hasSelections = selectedHoldings.size > 0
  const selectedHoldingsData = portfolio?.holdings.filter(h => selectedHoldings.has(h.ticker)) || []

  // Handle opening sell modal
  const handleOpenSellModal = (holding: any) => {
    setSelectedHoldingForSale(holding)
    setSellModalOpen(true)
  }

  // Handle closing sell modal
  const handleCloseSellModal = () => {
    setSellModalOpen(false)
    setSelectedHoldingForSale(null)
  }

  // Handle successful sell
  const handleSellSuccess = () => {
    // Refresh portfolio data after successful sell
    fetchPortfolio()
  }

  if (loading && !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-20 pb-8">
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="mb-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Cosmic Portfolio</h1>
              <p className="text-sm text-muted-foreground">Your stellar investment journey</p>
            </div>
          </div>
          <div className="flex items-center justify-center p-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">Loading your cosmic portfolio...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !portfolio) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-20 pb-8">
        <div className="relative z-10 max-w-7xl mx-auto px-4">
          <div className="mb-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Cosmic Portfolio</h1>
              <p className="text-sm text-muted-foreground">Your stellar investment journey</p>
            </div>
          </div>
          <div className="p-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            <Button onClick={fetchPortfolio} className="w-full mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!portfolio) return null

  const isPositive = Number(portfolio.total_gain_loss ?? 0) >= 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-20 pb-4">
      {/* Cosmic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-8 w-1 h-1 bg-accent rounded-full animate-pulse" />
        <div className="absolute top-40 right-12 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-primary rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-20 right-8 w-2 h-2 bg-accent rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">Cosmic Portfolio</h1>
            <p className="text-sm text-muted-foreground">Your stellar investment journey</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Connection Status Warning */}
          {usingCache && (
            <Alert className="bg-orange-500/10 border-orange-500/30">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              <AlertDescription className="text-sm">
                <div className="flex items-center justify-between">
                  <span>Unable to connect to server. Showing cached data.</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={fetchPortfolio}
                    disabled={loading}
                    className="h-6 px-2"
                  >
                    <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Last updated: {formatTimeSince(lastUpdated)}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Portfolio Summary Card - Always Visible */}
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 backdrop-blur-sm">
            <div className="space-y-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  ${Number(portfolio.total_portfolio_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div
                  className={`flex items-center justify-center gap-1 mt-1 ${isPositive ? "text-green-500" : "text-red-500"}`}
                >
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span className="font-medium">
                    {isPositive ? "+" : ""}${Math.abs(Number(portfolio.total_gain_loss ?? 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({isPositive ? "+" : ""}
                    {Number(portfolio.total_gain_loss_percent ?? 0).toFixed(2)}%)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Total Portfolio Value</p>
              </div>

              {/* Cosmic Vibe Index Meter with Info Icon */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-foreground">Cosmic Vibe Index</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => setShowInfoModal(true)}
                    >
                      <Info className="w-3 h-3 text-muted-foreground hover:text-accent transition-colors" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="w-3 h-3 text-accent" fill="currentColor" />
                    <span className={`text-sm font-bold ${getVibeColor(Number(portfolio.cosmic_vibe_index ?? 0))}`}>
                      {Number(portfolio.cosmic_vibe_index ?? 0)}%
                    </span>
                  </div>
                </div>
                <Progress value={Number(portfolio.cosmic_vibe_index ?? 0)} className="h-1.5" />
                <p className="text-xs text-muted-foreground text-center">
                  {getAlignmentPhrase(Number(portfolio.overall_alignment_score ?? 0))}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50">
                <div>
                  <span className="text-xs text-muted-foreground">Cash Balance</span>
                  <p className="font-medium text-foreground">
                    ${Number(portfolio.cash_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Stocks Value</span>
                  <p className="font-medium text-foreground">
                    ${Number(portfolio.stocks_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Holdings Section with Dynamic Layout */}
          {portfolio.holdings.length > 0 ? (
            <div className={cn(
              "grid gap-4 transition-all duration-500 ease-in-out",
              hasSelections ? "lg:grid-cols-[350px_1fr]" : "grid-cols-1"
            )}>
              {/* Holdings List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-foreground">Your Holdings</h2>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs">
                      {portfolio.holdings.length} Position{portfolio.holdings.length !== 1 ? 's' : ''}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Switch
                        id="select-all"
                        checked={selectAll}
                        onCheckedChange={handleSelectAllChange}
                      />
                      <Label htmlFor="select-all" className="text-xs cursor-pointer">
                        Select All
                      </Label>
                    </div>
                  </div>
                </div>

                <div className={cn(
                  "grid gap-3 transition-all duration-500",
                  hasSelections ? "grid-cols-1" : "sm:grid-cols-2"
                )}>
                  {portfolio.holdings.map((holding) => {
                    const isHoldingPositive = Number(holding.gain_loss ?? 0) >= 0
                    const isSelected = selectedHoldings.has(holding.ticker)

                    return (
                      <Card
                        key={holding.ticker}
                        className={cn(
                          "p-3 transition-all duration-300 group relative",
                          "hover:shadow-lg",
                          isSelected && "ring-2 ring-primary shadow-lg",
                          `bg-gradient-to-br ${elementColors[holding.element as keyof typeof elementColors]} backdrop-blur-sm`
                        )}
                      >
                        <div 
                          className="space-y-2 cursor-pointer"
                          onClick={() => toggleHolding(holding.ticker)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-background/80 rounded-full flex items-center justify-center text-lg">
                                {elementIcons[holding.element as keyof typeof elementIcons]}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-foreground">{holding.ticker}</h3>
                                  <Badge variant="outline" className="text-xs px-2 py-0">
                                    {holding.zodiac_sign}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {Number(holding.quantity)} share{Number(holding.quantity) !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-1">
                              <p className="font-bold text-foreground">
                                ${Number(holding.current_value ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                              <div
                                className={`flex items-center gap-1 text-xs ${isHoldingPositive ? "text-green-500" : "text-red-500"}`}
                              >
                                {isHoldingPositive ? (
                                  <TrendingUp className="w-3 h-3" />
                                ) : (
                                  <TrendingDown className="w-3 h-3" />
                                )}
                                <span>
                                  {isHoldingPositive ? "+" : ""}${Math.abs(Number(holding.gain_loss ?? 0)).toFixed(2)}
                                </span>
                              </div>
                              <StockSparkline 
                                ticker={holding.ticker} 
                                isPositive={isHoldingPositive}
                                purchaseDate={holding.purchase_date}
                                accountStartDate={accountStartDate}
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className={`w-4 h-4 ${getAlignmentColor(Number(holding.alignment_score ?? 0))}`} fill="currentColor" />
                              <span className={`text-sm font-medium ${getAlignmentColor(Number(holding.alignment_score ?? 0))}`}>
                                {Number(holding.alignment_score ?? 0)}% Aligned
                              </span>
                            </div>
                            <Badge className={getMatchTypeColor(holding.match_type)}>
                              {holding.match_type === 'same_sign' ? 'Same Sign' : holding.match_type}
                            </Badge>
                          </div>

                          {Number(holding.alignment_score ?? 0) >= 85 && (
                            <div className="flex items-center gap-1 text-xs text-accent">
                              <Sparkles className="w-3 h-3 animate-pulse" />
                              <span>Excellent Alignment!</span>
                            </div>
                          )}
                        </div>

                        {/* Sell Button - Always visible on mobile, hover on desktop */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenSellModal(holding)
                          }}
                          className={cn(
                            "absolute bottom-2 right-2 h-7 px-2 text-xs",
                            "bg-background/90 hover:bg-orange-500 hover:text-white border-orange-500/50 hover:border-orange-500",
                            "opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
                          )}
                        >
                          <ShoppingBag className="w-3 h-3 mr-1" />
                          Sell
                        </Button>
                      </Card>
                    )
                  })}
                </div>
              </div>

              {/* Combined Chart and Alignment Panel - Appears when selections are made */}
              {hasSelections && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right duration-500">
                  {/* Combined Chart */}
                  <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
                    <CombinedHoldingsChart 
                      tickers={Array.from(selectedHoldings)}
                      holdings={selectedHoldingsData}
                    />
                  </Card>

                  {/* Alignment Scores for Selected Holdings */}
                  <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Selected Holdings Alignment
                    </h3>
                    <div className="space-y-2">
                      {selectedHoldingsData.map((holding) => (
                        <div 
                          key={holding.ticker}
                          className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{holding.ticker}</span>
                            <Badge variant="outline" className="text-xs">
                              {holding.zodiac_sign}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star 
                              className={`w-4 h-4 ${getAlignmentColor(Number(holding.alignment_score ?? 0))}`} 
                              fill="currentColor" 
                            />
                            <span className={`text-xs font-medium ${getAlignmentColor(Number(holding.alignment_score ?? 0))}`}>
                              {Number(holding.alignment_score ?? 0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Elemental Balance for Selected */}
                  <Card className="p-4 bg-card/80 backdrop-blur-sm border-primary/20">
                    <h3 className="text-sm font-semibold text-foreground mb-3">Elemental Balance</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(portfolio.element_distribution).map(([element, percentage]) => (
                        <div
                          key={element}
                          className={`p-3 rounded-lg bg-gradient-to-br ${elementColors[element as keyof typeof elementColors]} border`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{elementIcons[element as keyof typeof elementIcons]}</span>
                            <div className="flex-1">
                              <div className="text-xs text-muted-foreground">{element}</div>
                              <div className="text-sm font-bold text-foreground">{percentage}%</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

            </div>
          ) : (
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 text-center">
              <div className="space-y-2">
                <p className="text-muted-foreground">No holdings yet</p>
                <p className="text-sm text-muted-foreground">Start investing to see your cosmic portfolio!</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Alignment Info Modal */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" />
              How Cosmic Alignment is Calculated
            </DialogTitle>
            <DialogDescription>
              Understanding your portfolio's cosmic energy
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Alignment Scoring</h4>
              <p className="text-muted-foreground mb-2">
                Each stock in your portfolio receives an alignment score based on zodiac compatibility:
              </p>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• <span className="text-purple-400 font-medium">Same Sign (100%):</span> Stock matches your zodiac sign exactly</li>
                <li>• <span className="text-green-400 font-medium">Positive Match (85%):</span> Highly compatible zodiac pairing</li>
                <li>• <span className="text-yellow-400 font-medium">Neutral Match (65%):</span> Moderate compatibility</li>
                <li>• <span className="text-orange-400 font-medium">Negative Match (40%):</span> Challenging cosmic aspects</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Overall Alignment Score</h4>
              <p className="text-muted-foreground">
                Your portfolio's overall alignment is calculated as a weighted average based on the current value of each position. 
                Larger positions have more influence on your overall cosmic energy.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Cosmic Vibe Index</h4>
              <p className="text-muted-foreground">
                The Cosmic Vibe Index combines your alignment score with a diversity bonus (up to +15 points) 
                for having stocks across multiple elements (Fire, Earth, Air, Water), promoting balance in your cosmic portfolio.
              </p>
            </div>

            <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-accent">Pro Tip:</span> Diversifying across compatible zodiac signs 
                and elements can maximize your Cosmic Vibe Index while maintaining strong alignment.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sell Stock Modal */}
      {selectedHoldingForSale && portfolio && (
        <SellStockModal
          open={sellModalOpen}
          onClose={handleCloseSellModal}
          holding={selectedHoldingForSale}
          currentPortfolio={{
            overall_alignment_score: portfolio.overall_alignment_score,
            cosmic_vibe_index: portfolio.cosmic_vibe_index,
            element_distribution: portfolio.element_distribution,
            total_portfolio_value: portfolio.total_portfolio_value,
            cash_balance: portfolio.cash_balance,
            stocks_value: portfolio.stocks_value,
          }}
          allHoldings={portfolio.holdings}
          onSellSuccess={handleSellSuccess}
        />
      )}
    </div>
  )
}

export default function PortfolioPage() {
  return (
    <ProtectedRoute>
      <PortfolioPageContent />
    </ProtectedRoute>
  )
}
