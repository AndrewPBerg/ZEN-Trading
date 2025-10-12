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
  ShoppingCart
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BuyStockModalProps {
  open: boolean
  onClose: () => void
  ticker: string
  stockData?: Stock
  onPurchaseSuccess?: () => void
}

type BuyMethod = "dollars" | "shares"

export function BuyStockModal({ open, onClose, ticker, stockData: initialStockData, onPurchaseSuccess }: BuyStockModalProps) {
  // State management
  const [buyMethod, setBuyMethod] = useState<BuyMethod>("dollars")
  const [amount, setAmount] = useState("")
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-background/95 dark:bg-card/95 backdrop-blur-sm border-border dark:border-primary/20 transition-all duration-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <ShoppingCart className="w-5 h-5" />
            <span>Buy {ticker}</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {stockData?.company_name || "Configure your purchase"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 transition-all duration-200">
          {/* Live Quote Display */}
          <div className="bg-muted/30 dark:bg-muted/20 border border-border/50 dark:border-border/30 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Market Price</span>
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
                  ${currentPrice.toFixed(2)}
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
                      ${Math.abs(priceChange).toFixed(2)} ({isPricePositive ? "+" : ""}
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
            <Label className="text-foreground">Buy Method</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={buyMethod === "dollars" ? "default" : "outline"}
                onClick={() => {
                  setBuyMethod("dollars")
                  setAmount("")
                }}
                className={cn(
                  buyMethod === "dollars" && "bg-gradient-to-r from-primary to-secondary text-white dark:text-white hover:from-primary hover:to-secondary"
                )}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Dollar Amount
              </Button>
              <Button
                type="button"
                variant={buyMethod === "shares" ? "default" : "outline"}
                onClick={() => {
                  setBuyMethod("shares")
                  setAmount("")
                }}
                className={cn(
                  buyMethod === "shares" && "bg-gradient-to-r from-primary to-secondary text-white dark:text-white hover:from-primary hover:to-secondary"
                )}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Shares
              </Button>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-foreground">
              {buyMethod === "dollars" ? "Dollar Amount" : "Number of Shares"}
            </Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step={buyMethod === "dollars" ? "0.01" : "0.0001"}
                min="0"
                placeholder={buyMethod === "dollars" ? "0.00" : "0.0000"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                  "text-lg font-semibold bg-background dark:bg-muted/10 text-foreground border-border",
                  buyMethod === "dollars" && "pl-6"
                )}
                disabled={isSubmitting}
              />
              {buyMethod === "dollars" && (
                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              )}
            </div>
            {buyMethod === "dollars" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setAmount(Number(balance).toFixed(2))}
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
              <div className="bg-primary/5 dark:bg-primary/10 rounded-lg p-4 space-y-2 border border-primary/20 dark:border-primary/30 animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Order Summary
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shares</span>
                    <span className="font-semibold text-foreground">
                      {calculatedShares.toFixed(4)} {ticker}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price per Share</span>
                    <span className="font-semibold text-foreground">${currentPrice.toFixed(2)}</span>
                  </div>
                  <Separator className="my-2 bg-border" />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-foreground">Estimated Total</span>
                    <span className="font-bold text-foreground">
                      ${estimatedTotal.toFixed(2)}
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
                      ${remainingBalance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

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
                    You need ${(estimatedTotal - Number(balance)).toFixed(2)} more to complete this purchase.
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
              onClick={handlePurchase}
              disabled={!canSubmit}
              className="flex-1 bg-gradient-to-r from-primary to-secondary text-white dark:text-white hover:from-primary hover:to-secondary disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
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

