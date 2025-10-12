"use client"

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Stock, getStockByTicker } from "@/lib/api/stocks"
import { executeTrade, type PortfolioHolding } from "@/lib/api/holdings"
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
  ShoppingBag,
  Star,
  Sparkles,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SellStockModalProps {
  open: boolean
  onClose: () => void
  holding: PortfolioHolding
  currentPortfolio: {
    overall_alignment_score: number
    cosmic_vibe_index: number
    element_distribution: { Fire: number; Earth: number; Air: number; Water: number }
    total_portfolio_value: number
    cash_balance: number
    stocks_value: number
  }
  allHoldings: PortfolioHolding[]
  onSellSuccess?: () => void
}

type SellMethod = "dollars" | "shares"

export function SellStockModal({ 
  open, 
  onClose, 
  holding, 
  currentPortfolio,
  allHoldings,
  onSellSuccess 
}: SellStockModalProps) {
  // State management
  const [sellMethod, setSellMethod] = useState<SellMethod>("shares")
  const [amount, setAmount] = useState("")
  const [displayAmount, setDisplayAmount] = useState("") // Formatted display value with commas
  const [stockData, setStockData] = useState<Stock | undefined>()
  const [isLoadingPrice, setIsLoadingPrice] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Parse current price
  const currentPrice = stockData?.current_price
    ? typeof stockData.current_price === "string"
      ? parseFloat(stockData.current_price)
      : stockData.current_price
    : holding.current_price

  const previousClose = stockData?.previous_close
    ? typeof stockData.previous_close === "string"
      ? parseFloat(stockData.previous_close)
      : stockData.previous_close
    : 0

  // Calculate price change
  const priceChange = currentPrice && previousClose ? currentPrice - previousClose : 0
  const priceChangePercent = currentPrice && previousClose ? (priceChange / previousClose) * 100 : 0
  const isPricePositive = priceChange >= 0

  // Parse owned quantity
  const ownedShares = typeof holding.quantity === "string" 
    ? parseFloat(holding.quantity) 
    : holding.quantity
  const purchasePrice = typeof holding.purchase_price === "string"
    ? parseFloat(holding.purchase_price)
    : holding.purchase_price

  // Calculate quantities and proceeds
  const parsedAmount = parseFloat(amount) || 0
  const calculatedShares = sellMethod === "dollars" && currentPrice > 0 ? parsedAmount / currentPrice : parsedAmount
  const calculatedProceeds = sellMethod === "shares" && currentPrice > 0 ? parsedAmount * currentPrice : parsedAmount
  const estimatedProceeds = sellMethod === "dollars" ? parsedAmount : calculatedProceeds
  const sharesToSell = sellMethod === "dollars" ? calculatedShares : parsedAmount
  const remainingShares = ownedShares - sharesToSell

  // Calculate profit/loss
  const profitLoss = (currentPrice - purchasePrice) * sharesToSell
  const profitLossPercent = purchasePrice > 0 ? (profitLoss / (purchasePrice * sharesToSell)) * 100 : 0
  const isProfitable = profitLoss >= 0

  // New balance after sale
  const newBalance = currentPortfolio.cash_balance + estimatedProceeds

  // Validation
  const isExceedsOwned = sharesToSell > ownedShares
  const isInvalidAmount = parsedAmount <= 0 || isNaN(parsedAmount)
  const canSubmit = !isInvalidAmount && !isExceedsOwned && !isSubmitting && currentPrice > 0

  // Calculate cosmic impact
  const calculateCosmicImpact = useCallback(() => {
    if (isInvalidAmount || isExceedsOwned) {
      return {
        newAlignment: currentPortfolio.overall_alignment_score,
        alignmentChange: 0,
        newVibeIndex: currentPortfolio.cosmic_vibe_index,
        vibeChange: 0,
        newElementDistribution: currentPortfolio.element_distribution
      }
    }

    // Calculate new portfolio without this sale amount
    const remainingValue = (ownedShares - sharesToSell) * currentPrice
    const thisHoldingCurrentValue = ownedShares * currentPrice
    
    // Recalculate alignment score
    let totalWeightedAlignment = 0
    let newStocksValue = 0
    const newElementValues = { Fire: 0, Earth: 0, Air: 0, Water: 0 }

    allHoldings.forEach((h) => {
      let holdingValue = h.current_value
      
      // Adjust for the holding being sold
      if (h.ticker === holding.ticker) {
        holdingValue = remainingValue
      }
      
      if (holdingValue > 0) {
        newStocksValue += holdingValue
        totalWeightedAlignment += h.alignment_score * holdingValue
        
        // Track element distribution
        const element = h.element as keyof typeof newElementValues
        if (element in newElementValues) {
          newElementValues[element] += holdingValue
        }
      }
    })

    const newAlignment = newStocksValue > 0 
      ? Math.round(totalWeightedAlignment / newStocksValue) 
      : 50

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
  }, [sharesToSell, isInvalidAmount, isExceedsOwned, currentPrice, ownedShares, holding, allHoldings, currentPortfolio])

  const cosmicImpact = calculateCosmicImpact()

  // Fetch stock price
  const fetchStockPrice = useCallback(async () => {
    if (!holding.ticker) return
    
    setIsLoadingPrice(true)
    setError(null)
    
    try {
      const data = await getStockByTicker(holding.ticker)
      setStockData(data)
      setLastUpdated(new Date())
    } catch (err) {
      console.error("Failed to fetch stock price:", err)
      // Don't set error for price refresh failures, just use cached price
    } finally {
      setIsLoadingPrice(false)
    }
  }, [holding.ticker])

  // Initialize data when modal opens
  useEffect(() => {
    if (open) {
      setError(null)
      setAmount("")
      setDisplayAmount("")
      setSellMethod("shares")
      fetchStockPrice()
    }
  }, [open, fetchStockPrice])

  // Set up live price polling (every 4 seconds)
  useEffect(() => {
    if (!open || !holding.ticker) return

    const interval = setInterval(() => {
      fetchStockPrice()
    }, 4000)

    return () => clearInterval(interval)
  }, [open, holding.ticker, fetchStockPrice])

  // Handle sell
  const handleSell = async () => {
    if (!canSubmit) return

    setIsSubmitting(true)
    setError(null)

    try {
      const quantity = sellMethod === "dollars" ? calculatedShares : parsedAmount
      const totalValue = sellMethod === "dollars" ? parsedAmount : calculatedProceeds

      await executeTrade({
        ticker: holding.ticker,
        quantity,
        total_value: totalValue,
        action: "sell",
      })

      // Success! Close modal and notify parent
      onClose()
      if (onSellSuccess) {
        onSellSuccess()
      }
    } catch (err) {
      console.error("Failed to execute sell:", err)
      setError(err instanceof Error ? err.message : "Failed to execute sell order")
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
    const cleanValue = value.replace(/[^0-9.]/g, '')
    if (!cleanValue || cleanValue === '.') return cleanValue
    
    const parts = cleanValue.split('.')
    const integerPart = parts[0]
    const decimalPart = parts[1]
    
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    
    if (decimalPart !== undefined) {
      return `${formattedInteger}.${decimalPart.slice(0, decimals)}`
    }
    
    return formattedInteger
  }

  // Handle amount input change
  const handleAmountChange = (value: string) => {
    const cleanValue = value.replace(/,/g, '')
    setAmount(cleanValue)
    setDisplayAmount(formatInputNumber(value, sellMethod === "dollars" ? 2 : 4))
  }

  const getAlignmentColor = (score: number) => {
    if (score >= 85) return "text-green-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 50) return "text-yellow-500"
    return "text-orange-500"
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-background/95 dark:bg-card/95 backdrop-blur-sm border-border dark:border-primary/20 transition-all duration-200 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <span>Sell {holding.ticker}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {stockData?.company_name || holding.company_name || "Configure your sale"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 transition-all duration-200">
          {/* Current Position Summary */}
          <div className="bg-muted/30 dark:bg-muted/20 border border-border/50 dark:border-border/30 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Your Position
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Shares Owned</span>
                <p className="font-semibold text-foreground">
                  {ownedShares.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Purchase Price</span>
                <p className="font-semibold text-foreground">${formatCurrency(purchasePrice)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Current Value</span>
                <p className="font-semibold text-foreground">
                  ${formatCurrency(holding.current_value)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Gain/Loss</span>
                <p className={cn(
                  "font-semibold flex items-center gap-1",
                  holding.gain_loss >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {holding.gain_loss >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {holding.gain_loss >= 0 ? "+" : ""}${formatCurrency(Math.abs(holding.gain_loss))}
                </p>
              </div>
            </div>
          </div>

          {/* Live Quote Display */}
          <div className="bg-muted/30 dark:bg-muted/20 border border-border/50 dark:border-border/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Current Price</span>
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
                <p className="text-3xl font-bold text-foreground">
                  ${formatCurrency(currentPrice)}
                </p>
                {priceChange !== 0 && (
                  <div className={cn(
                    "flex items-center gap-1 text-sm font-medium",
                    isPricePositive 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-red-600 dark:text-red-400"
                  )}>
                    {isPricePositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
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

          <Separator />

          {/* Sell Method Toggle */}
          <div className="space-y-3">
            <Label className="text-foreground">Sell Method</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={sellMethod === "shares" ? "default" : "outline"}
                onClick={() => {
                  setSellMethod("shares")
                  setAmount("")
                  setDisplayAmount("")
                }}
                className={cn(
                  sellMethod === "shares" && "bg-gradient-to-r from-orange-500 to-red-500 text-white dark:text-white hover:from-orange-500 hover:to-red-500"
                )}
              >
                <TrendingDown className="w-4 h-4 mr-2" />
                Shares
              </Button>
              <Button
                type="button"
                variant={sellMethod === "dollars" ? "default" : "outline"}
                onClick={() => {
                  setSellMethod("dollars")
                  setAmount("")
                  setDisplayAmount("")
                }}
                className={cn(
                  sellMethod === "dollars" && "bg-gradient-to-r from-orange-500 to-red-500 text-white dark:text-white hover:from-orange-500 hover:to-red-500"
                )}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Dollar Amount
              </Button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">
              {sellMethod === "dollars" ? "Dollar Amount to Receive" : "Number of Shares to Sell"}
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="text"
                inputMode="decimal"
                placeholder={sellMethod === "dollars" ? "0.00" : "0.0000"}
                value={displayAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={cn(
                  "text-lg font-semibold bg-background dark:bg-muted/10 text-foreground border-border",
                  sellMethod === "dollars" && "pl-6"
                )}
                disabled={isSubmitting}
              />
              {sellMethod === "dollars" && (
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const maxValue = sellMethod === "shares" 
                  ? ownedShares.toFixed(4) 
                  : (ownedShares * currentPrice).toFixed(2)
                setAmount(maxValue)
                setDisplayAmount(formatInputNumber(maxValue, sellMethod === "shares" ? 4 : 2))
              }}
              disabled={isSubmitting}
              className="text-xs hover:bg-background dark:hover:bg-card"
            >
              Sell All ({sellMethod === "shares" ? `${ownedShares.toFixed(4)} shares` : `$${formatCurrency(ownedShares * currentPrice)}`})
            </Button>
          </div>

          {/* Order Summary */}
          <div className="min-h-[180px] transition-all duration-300">
            {parsedAmount > 0 && !isNaN(parsedAmount) && (
              <div className="bg-orange-500/5 dark:bg-orange-500/10 rounded-lg p-4 space-y-2 border border-orange-500/20 dark:border-orange-500/30 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Sale Summary
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shares to Sell</span>
                    <span className="font-semibold text-foreground">
                      {sharesToSell.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })} {holding.ticker}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per Share</span>
                    <span className="font-semibold text-foreground">${formatCurrency(currentPrice)}</span>
                  </div>
                  <Separator className="my-2 bg-border" />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-foreground">Estimated Proceeds</span>
                    <span className="font-bold text-foreground">
                      ${formatCurrency(estimatedProceeds)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit/Loss on Sale</span>
                    <span className={cn(
                      "font-semibold transition-colors duration-200 flex items-center gap-1",
                      isProfitable 
                        ? "text-green-600 dark:text-green-400" 
                        : "text-red-600 dark:text-red-400"
                    )}>
                      {isProfitable ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isProfitable ? "+" : ""}${formatCurrency(Math.abs(profitLoss))} ({isProfitable ? "+" : ""}{profitLossPercent.toFixed(2)}%)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining Shares</span>
                    <span className="font-semibold text-foreground">
                      {remainingShares >= 0 ? remainingShares.toFixed(4) : "0.0000"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">New Cash Balance</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      ${formatCurrency(newBalance)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cosmic Impact Preview */}
          {parsedAmount > 0 && !isNaN(parsedAmount) && !isExceedsOwned && (
            <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 space-y-3 border border-primary/20 dark:border-primary/30 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Cosmic Impact
                </p>
              </div>
              
              <div className="space-y-2">
                {/* Alignment Score Change */}
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

                {/* Vibe Index Change */}
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

                {/* Element Impact Note */}
                {remainingShares <= 0 && (
                  <div className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                    Selling all {holding.ticker} will remove {holding.element} influence from your portfolio
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error and Validation Messages */}
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
            {!error && !isInvalidAmount && isExceedsOwned && (
              <div className="flex items-start gap-2 bg-yellow-500/10 dark:bg-yellow-500/20 border border-yellow-500/30 dark:border-yellow-500/50 rounded-lg p-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Insufficient Shares</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-300">
                    You only own {ownedShares.toFixed(4)} shares. Trying to sell {sharesToSell.toFixed(4)} shares.
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
              className="flex-1 border-border hover:border-border hover:bg-background dark:hover:bg-card"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSell}
              disabled={!canSubmit}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white dark:text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing Sale...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm Sale
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

