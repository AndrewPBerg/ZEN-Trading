"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Stock, getStockByTicker } from "@/lib/api/stocks"
import { getUserHoldings, executeTrade } from "@/lib/api/holdings"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Loader2, 
  AlertCircle, 
  CheckCircle2,
  RefreshCcw,
  Wallet,
  ShoppingCart,
  Star,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { PortfolioHolding } from "@/lib/api/holdings"

interface BuyStockModalProps {
  open: boolean
  onClose: () => void
  ticker: string
  stockData?: Stock
  onPurchaseSuccess?: () => void
  currentPortfolio?: {
    overall_alignment_score: number
    cosmic_vibe_index: number
    element_distribution: { Fire: number; Earth: number; Air: number; Water: number }
    total_portfolio_value: number
    cash_balance: number
    stocks_value: number
  }
  allHoldings?: PortfolioHolding[]
}

type BuyMethod = "dollars" | "shares"

export function BuyStockModal({ 
  open, 
  onClose, 
  ticker, 
  stockData: initialStockData, 
  onPurchaseSuccess,
  currentPortfolio,
  allHoldings
}: BuyStockModalProps) {
  // State management
  const [buyMethod, setBuyMethod] = useState<BuyMethod>("dollars")
  const [amount, setAmount] = useState("")
  const [displayAmount, setDisplayAmount] = useState("") // Formatted display value with commas
  const [stockData, setStockData] = useState<Stock | undefined>(initialStockData)
  const [balance, setBalance] = useState<number>(0)
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [isLoadingBalance, setIsLoadingBalance] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [priceRefreshKey, setPriceRefreshKey] = useState(0)

  // Parse current price
  const currentPrice = stockData?.current_price
    ? typeof stockData.current_price === "string"
      ? parseFloat(stockData.current_price)
      : stockData.current_price
    : 0

  const previousClose = stockData?.previous_close
    ? typeof stockData.previous_close === "string"
      ? parseFloat(stockData.previous_close)
      : stockData.previous_close
    : 0

  // Calculate price change
  const priceChange = currentPrice && previousClose ? currentPrice - previousClose : 0
  const priceChangePercent = currentPrice && previousClose ? (priceChange / previousClose) * 100 : 0
  const isPricePositive = priceChange >= 0

  // Calculate quantities and costs
  const parsedAmount = parseFloat(amount) || 0
  const calculatedShares = buyMethod === "dollars" && currentPrice > 0 ? parsedAmount / currentPrice : parsedAmount
  const calculatedCost = buyMethod === "shares" && currentPrice > 0 ? parsedAmount * currentPrice : parsedAmount
  const estimatedTotal = buyMethod === "dollars" ? parsedAmount : calculatedCost
  const remainingBalance = Number(balance) - estimatedTotal

  // Validation
  const isInsufficientBalance = estimatedTotal > Number(balance)
  const isInvalidAmount = parsedAmount <= 0 || isNaN(parsedAmount)
  const canSubmit = !isInvalidAmount && !isInsufficientBalance && !isSubmitting && currentPrice > 0

  // Calculate alignment score for the stock being purchased
  const getAlignmentScore = (matchType?: string, isSameSign?: boolean): number => {
    if (isSameSign) return 100
    if (matchType === 'positive') return 85
    if (matchType === 'neutral') return 65
    if (matchType === 'negative') return 40
    return 65 // Default neutral
  }

  // Calculate cosmic impact of purchase
  const calculateCosmicImpact = useCallback(() => {
    if (!currentPortfolio || !allHoldings || !stockData || isInvalidAmount || isInsufficientBalance) {
      return {
        newAlignment: currentPortfolio?.overall_alignment_score || 0,
        alignmentChange: 0,
        newVibeIndex: currentPortfolio?.cosmic_vibe_index || 0,
        vibeChange: 0,
        newElementDistribution: currentPortfolio?.element_distribution || { Fire: 0, Earth: 0, Air: 0, Water: 0 }
      }
    }

    // Calculate the value of shares being purchased
    const purchaseValue = buyMethod === "dollars" ? parsedAmount : parsedAmount * currentPrice
    
    // Get alignment score for the stock being purchased
    const stockAlignmentScore = getAlignmentScore(stockData.match_type, stockData.is_same_sign)
    
    // Get stock element
    const stockElement = stockData.element || 'Fire'
    
    // Recalculate alignment score with new purchase
    let totalWeightedAlignment = 0
    let newStocksValue = 0
    const newElementValues = { Fire: 0, Earth: 0, Air: 0, Water: 0 }

    // Add existing holdings
    allHoldings.forEach((h) => {
      const holdingValue = h.current_value
      newStocksValue += holdingValue
      totalWeightedAlignment += h.alignment_score * holdingValue
      
      // Track element distribution
      const element = h.element as keyof typeof newElementValues
      if (element in newElementValues) {
        newElementValues[element] += holdingValue
      }
    })

    // Check if we already own this stock
    const existingHolding = allHoldings.find(h => h.ticker === ticker)
    if (existingHolding) {
      // We're adding to an existing position, so we need to adjust the weighted alignment
      // The existing holding is already counted above, so just add the new purchase
      newStocksValue += purchaseValue
      totalWeightedAlignment += stockAlignmentScore * purchaseValue
      
      // Add to element distribution
      const element = stockElement as keyof typeof newElementValues
      if (element in newElementValues) {
        newElementValues[element] += purchaseValue
      }
    } else {
      // New position
      newStocksValue += purchaseValue
      totalWeightedAlignment += stockAlignmentScore * purchaseValue
      
      // Add to element distribution
      const element = stockElement as keyof typeof newElementValues
      if (element in newElementValues) {
        newElementValues[element] += purchaseValue
      }
    }

    const newAlignment = newStocksValue > 0 
      ? Math.round(totalWeightedAlignment / newStocksValue) 
      : currentPortfolio.overall_alignment_score

    // Calculate element distribution percentages
    const newElementDistribution: typeof currentPortfolio.element_distribution = { 
      Fire: 0, Earth: 0, Air: 0, Water: 0 
    }
    if (newStocksValue > 0) {
      Object.keys(newElementValues).forEach((element) => {
        const key = element as keyof typeof newElementValues
        newElementDistribution[key] = Math.round((newElementValues[key] / newStocksValue) * 100)
      })
    }

    // Calculate diversity bonus
    const elementsWithHoldings = Object.values(newElementValues).filter(v => v > 0).length
    const diversityBonus = Math.min(elementsWithHoldings * 3, 15)
    const newVibeIndex = Math.min(newAlignment + diversityBonus, 100)

    return {
      newAlignment,
      alignmentChange: newAlignment - currentPortfolio.overall_alignment_score,
      newVibeIndex,
      vibeChange: newVibeIndex - currentPortfolio.cosmic_vibe_index,
      newElementDistribution
    }
  }, [calculatedShares, parsedAmount, isInvalidAmount, isInsufficientBalance, currentPrice, ticker, stockData, allHoldings, currentPortfolio, buyMethod])

  const cosmicImpact = currentPortfolio && allHoldings ? calculateCosmicImpact() : null

  const getAlignmentColor = (score: number) => {
    if (score >= 85) return "text-green-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 50) return "text-yellow-500"
    return "text-orange-500"
  }

  // Fetch stock price
  const fetchStockPrice = useCallback(async () => {
    if (!ticker) return
    
    setIsLoadingPrice(true)
    setError(null)
    
    try {
      const data = await getStockByTicker(ticker)
      setStockData(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Failed to fetch stock price:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch stock price")
    } finally {
      setIsLoadingPrice(false)
    }
  }, [ticker])

  // Fetch user balance
  const fetchBalance = useCallback(async () => {
    setIsLoadingBalance(true)
    try {
      const holdings = await getUserHoldings()
      // Ensure balance is a number (API might return string)
      const balanceValue = typeof holdings.balance === 'string' 
        ? parseFloat(holdings.balance) 
        : holdings.balance
      setBalance(balanceValue)
    } catch (err) {
      console.error("Failed to fetch balance:", err)
      // Don't set error here as it's not critical to the flow
    } finally {
      setIsLoadingBalance(false)
    }
  }, [])

  // Initialize data when modal opens
  useEffect(() => {
    if (open) {
      setError(null)
      setAmount("")
      setDisplayAmount("")
      fetchStockPrice()
      fetchBalance()
    }
  }, [open, fetchStockPrice, fetchBalance])

  // Set up live price polling (every 4 seconds)
  useEffect(() => {
    if (!open || !ticker) return

    const interval = setInterval(() => {
      fetchStockPrice()
      setPriceRefreshKey(prev => prev + 1)
    }, 4000)

    return () => clearInterval(interval)
  }, [open, ticker, fetchStockPrice])

  // Handle purchase
  const handlePurchase = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)

    try {
      const quantity = buyMethod === "dollars" ? calculatedShares : parsedAmount
      const totalValue = buyMethod === "dollars" ? parsedAmount : calculatedCost

      await executeTrade({
        ticker,
        quantity,
        total_value: totalValue,
        action: "buy",
      })

      // Success! Close modal and notify parent
      onClose()
      if (onPurchaseSuccess) {
        onPurchaseSuccess()
      }
    } catch (err) {
      console.error("Failed to execute trade:", err)
      setError(err instanceof Error ? err.message : "Failed to execute trade")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 5) return "just now"
    if (seconds < 60) return `${seconds}s ago`
    return date.toLocaleTimeString()
  }

  // Format number with commas for readability
  const formatCurrency = (value: number) => {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Format number with commas for input display
  const formatInputNumber = (value: string, decimals: number = 2): string => {
    // Remove all non-numeric characters except decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '')
    
    // Handle empty or invalid input
    if (!cleanValue || cleanValue === '.') return cleanValue
    
    // Split into integer and decimal parts
    const parts = cleanValue.split('.')
    const integerPart = parts[0]
    const decimalPart = parts[1]
    
    // Format integer part with commas
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    
    // Reconstruct with decimal part if present
    if (decimalPart !== undefined) {
      return `${formattedInteger}.${decimalPart.slice(0, decimals)}`
    }
    
    return formattedInteger
  }

  // Handle amount input change
  const handleAmountChange = (value: string) => {
    // Remove commas and store the clean numeric value
    const cleanValue = value.replace(/,/g, '')
    
    // Update both the actual value and display value
    setAmount(cleanValue)
    setDisplayAmount(formatInputNumber(value, buyMethod === "dollars" ? 2 : 4))
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-background/95 dark:bg-card/95 backdrop-blur-sm border-border dark:border-primary/20 transition-all duration-200 max-h-[90vh] overflow-y-auto mx-4 sm:mx-0 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-2 [&::-webkit-scrollbar-thumb]:border-transparent hover:[&::-webkit-scrollbar-thumb]:bg-primary/30 dark:[&::-webkit-scrollbar-thumb]:bg-primary/30 dark:hover:[&::-webkit-scrollbar-thumb]:bg-primary/40">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground text-lg sm:text-xl">
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Buy {ticker}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm sm:text-base">
            {stockData?.company_name || "Configure your purchase"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 transition-all duration-200">
          {/* Live Quote Display */}
          <div className="bg-muted/30 dark:bg-muted/20 border border-border/50 dark:border-border/30 rounded-lg p-3 sm:p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Market Price</span>
                {isLoadingPrice && (
                  <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                )}
              </div>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(lastUpdated)}
                </span>
              )}
            </div>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-foreground">
                  ${formatCurrency(currentPrice)}
                </p>
                {priceChange !== 0 && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs sm:text-sm font-medium",
                    isPricePositive 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  )}>
                    {isPricePositive ? (
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                    <span>
                      {isPricePositive ? "+" : ""}
                      ${formatCurrency(Math.abs(priceChange))} ({isPricePositive ? "+" : ""}
                      {priceChangePercent.toFixed(2)}%)
                    </span>
                  </div>
                )}
              </div>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={fetchStockPrice}
                disabled={isLoadingPrice}
                className="h-8 px-2 hover:bg-transparent"
              >
                <RefreshCcw className={cn("w-4 h-4", isLoadingPrice && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Available Balance */}
          <div className="flex items-center justify-between bg-muted/20 dark:bg-muted/10 border border-border/50 dark:border-border/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Available Balance</span>
            </div>
            <div className="flex items-center gap-2">
              {isLoadingBalance ? (
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              ) : (
                <span className={cn(
                  "text-lg font-bold",
                  isInsufficientBalance && !isInvalidAmount 
                    ? "text-red-500 dark:text-red-400" 
                    : "text-foreground"
                )}>
                  ${Number(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>

          <Separator />

          {/* Buy Method Toggle */}
          <div className="space-y-3">
            <Label className="text-foreground text-sm sm:text-base">Buy Method</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={buyMethod === "dollars" ? "default" : "outline"}
                onClick={() => {
                  setBuyMethod("dollars")
                  setAmount("")
                  setDisplayAmount("")
                }}
                className={cn(
                  "text-xs sm:text-sm h-10",
                  buyMethod === "dollars" && "bg-gradient-to-r from-primary to-secondary text-white dark:text-white hover:from-primary hover:to-secondary"
                )}
              >
                <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Dollar Amount
              </Button>
              <Button
                type="button"
                variant={buyMethod === "shares" ? "default" : "outline"}
                onClick={() => {
                  setBuyMethod("shares")
                  setAmount("")
                  setDisplayAmount("")
                }}
                className={cn(
                  buyMethod === "shares" && "bg-gradient-to-r from-primary to-secondary text-white dark:text-white hover:from-primary hover:to-secondary"
                )}
              >
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                Shares
              </Button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground text-sm sm:text-base">
              {buyMethod === "dollars" ? "Dollar Amount" : "Number of Shares"}
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder={buyMethod === "dollars" ? "0.00" : "0.0000"}
                value={displayAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={cn(
                  "text-base sm:text-lg font-semibold bg-background dark:bg-muted/10 text-foreground border-border h-10",
                  buyMethod === "dollars" && "pl-6"
                )}
                disabled={isSubmitting}
              />
              {buyMethod === "dollars" && (
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
              )}
            </div>
            {buyMethod === "dollars" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const maxValue = Number(balance).toFixed(2)
                  setAmount(maxValue)
                  setDisplayAmount(formatInputNumber(maxValue, 2))
                }}
                disabled={isSubmitting || balance <= 0}
                className="text-xs hover:bg-background dark:hover:bg-card"
              >
                Use Max Balance
              </Button>
            )}
          </div>

          {/* Order Summary - Reserved space for smooth transitions */}
          <div className="min-h-[180px] transition-all duration-300">
            {parsedAmount > 0 && !isNaN(parsedAmount) && (
              <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-3 sm:p-4 space-y-2 border border-primary/20 dark:border-primary/30 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Order Summary
                </p>
                <div className="space-y-1.5 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shares</span>
                    <span className="font-semibold text-foreground">
                      {calculatedShares.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {ticker}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per Share</span>
                    <span className="font-semibold text-foreground">${formatCurrency(currentPrice)}</span>
                  </div>
                  <Separator className="my-2 bg-border" />
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="font-semibold text-foreground">Estimated Total</span>
                    <span className="font-bold text-foreground">
                      ${formatCurrency(estimatedTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining Balance</span>
                    <span className={cn(
                      "font-semibold transition-colors duration-200",
                      remainingBalance < 0 
                        ? "text-red-500 dark:text-red-400" 
                        : "text-green-600 dark:text-green-400"
                    )}>
                      ${formatCurrency(remainingBalance)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cosmic Impact Preview */}
          {cosmicImpact && parsedAmount > 0 && !isNaN(parsedAmount) && !isInsufficientBalance && (
            <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 space-y-3 border border-primary/20 dark:border-primary/30 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Cosmic Impact
                </p>
              </div>
              
              <div className="space-y-2">
                {/* Alignment Score Change */}
                {currentPortfolio && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Alignment Score</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-semibold", getAlignmentColor(currentPortfolio.overall_alignment_score))}>
                        {currentPortfolio.overall_alignment_score}%
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className={cn("text-sm font-semibold", getAlignmentColor(cosmicImpact.newAlignment))}>
                        {cosmicImpact.newAlignment}%
                      </span>
                      <span className={cn(
                        "text-xs font-medium",
                        cosmicImpact.alignmentChange > 0 ? "text-green-500" : cosmicImpact.alignmentChange < 0 ? "text-red-500" : "text-muted-foreground"
                      )}>
                        ({cosmicImpact.alignmentChange > 0 ? "+" : ""}{cosmicImpact.alignmentChange})
                      </span>
                    </div>
                  </div>
                )}

                {/* Vibe Index Change */}
                {currentPortfolio && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-accent" fill="currentColor" />
                      <span className="text-sm text-muted-foreground">Cosmic Vibe</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-semibold", getAlignmentColor(currentPortfolio.cosmic_vibe_index))}>
                        {currentPortfolio.cosmic_vibe_index}%
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className={cn("text-sm font-semibold", getAlignmentColor(cosmicImpact.newVibeIndex))}>
                        {cosmicImpact.newVibeIndex}%
                      </span>
                      <span className={cn(
                        "text-xs font-medium",
                        cosmicImpact.vibeChange > 0 ? "text-green-500" : cosmicImpact.vibeChange < 0 ? "text-red-500" : "text-muted-foreground"
                      )}>
                        ({cosmicImpact.vibeChange > 0 ? "+" : ""}{cosmicImpact.vibeChange})
                      </span>
                    </div>
                  </div>
                )}

                {/* Element Impact Note */}
                {stockData?.element && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                    Adding {ticker} will {allHoldings?.find(h => h.ticker === ticker) ? 'increase' : 'add'} {stockData.element} influence {allHoldings?.find(h => h.ticker === ticker) ? 'in' : 'to'} your portfolio
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error and Validation Messages - Reserved space for smooth transitions */}
          <div className="min-h-[60px] transition-all duration-300">
            {error && (
              <div className="flex items-start gap-2 bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 dark:border-red-500/50 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Error</p>
                  <p className="text-xs text-red-500 dark:text-red-300">{error}</p>
                </div>
              </div>
            )}

            {/* Validation Warnings */}
            {!error && !isInvalidAmount && isInsufficientBalance && (
              <div className="flex items-start gap-2 bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/30 dark:border-yellow-500/50 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Insufficient Balance</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-300">
                    You need ${formatCurrency(estimatedTotal - Number(balance))} more to complete this purchase.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border-border hover:border-border hover:bg-background dark:hover:bg-card h-10 text-sm sm:text-base"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handlePurchase}
              disabled={!canSubmit}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white dark:text-white hover:from-primary hover:to-secondary disabled:opacity-50 h-10 text-sm sm:text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                  Confirm Purchase
                </>
              )}
            </Button>
          </div>

          {/* Market Order Notice */}
          <p className="text-xs text-center text-muted-foreground">
            This is a market order. The final execution price may vary slightly from the displayed price.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}

