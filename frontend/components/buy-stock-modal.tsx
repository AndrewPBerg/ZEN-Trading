"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Stock } from "@/lib/api/stocks"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

interface BuyStockModalProps {
  open: boolean
  onClose: () => void
  ticker: string
  stockData?: Stock
}

export function BuyStockModal({ open, onClose, ticker, stockData }: BuyStockModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Buy {ticker}</span>
            {stockData && stockData.current_price && (
              <Badge variant="secondary" className="text-xs">
                $
                {(typeof stockData.current_price === "string"
                  ? parseFloat(stockData.current_price)
                  : stockData.current_price
                ).toFixed(2)}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {stockData?.company_name || "Configure your purchase"}
          </DialogDescription>
        </DialogHeader>

        {/* Placeholder content area */}
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-foreground">Paper Trading Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              The cosmic trading experience is being aligned. Configure your purchases, manage positions, and track
              your portfolio performance.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

