"use client"

import { TarotCard, TarotCardContent, TarotCorners } from "@/components/ui/tarot-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Star, Plus, Eye } from "lucide-react"

interface Stock {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  alignment: number
  zodiacMatch: string
  sector: string
  cosmicNote: string
  element: string
  logo: string
}

interface StockCardProps {
  stock: Stock
  isSelected: boolean
  onSelect: () => void
}

export function StockCard({ stock, isSelected, onSelect }: StockCardProps) {
  const isPositive = stock.change >= 0
  const alignmentColor =
    stock.alignment >= 80 ? "text-green-500" : stock.alignment >= 60 ? "text-yellow-500" : "text-orange-500"

  const elementColors = {
    Fire: "from-red-500/20 to-orange-500/20 border-red-500/30",
    Earth: "from-green-500/20 to-emerald-500/20 border-green-500/30",
    Air: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
    Water: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
  }

  return (
    <TarotCard
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${
        isSelected ? "ring-2 ring-primary shadow-lg scale-[1.02]" : ""
      } bg-gradient-to-br ${elementColors[stock.element as keyof typeof elementColors]} backdrop-blur-sm`}
      onClick={onSelect}
    >
      <TarotCorners />
      <TarotCardContent className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-background/80 rounded-full flex items-center justify-center text-lg">
              {stock.logo}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">{stock.ticker}</h3>
                <Badge variant="outline" className="text-xs px-2 py-0">
                  {stock.zodiacMatch}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-32">{stock.name}</p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-bold text-foreground">${stock.price.toFixed(2)}</p>
            <div className={`flex items-center gap-1 text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span>
                {isPositive ? "+" : ""}
                {stock.change.toFixed(2)} ({isPositive ? "+" : ""}
                {stock.changePercent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Alignment Score */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className={`w-4 h-4 ${alignmentColor}`} fill="currentColor" />
            <span className={`text-sm font-medium ${alignmentColor}`}>{stock.alignment}% Aligned</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {stock.element}
          </Badge>
        </div>

        {/* Cosmic Note */}
        <div className="bg-background/50 rounded-lg p-3">
          <p className="text-xs text-muted-foreground leading-relaxed">{stock.cosmicNote}</p>
        </div>

        {/* Expanded Actions */}
        {isSelected && (
          <div className="flex gap-2 pt-2 border-t border-border/50">
            <Button size="sm" className="flex-1 bg-primary/20 text-primary hover:bg-primary/30">
              <Plus className="w-3 h-3 mr-1" />
              Add to Watchlist
            </Button>
            <Button size="sm" variant="outline" className="flex-1 bg-transparent">
              <Eye className="w-3 h-3 mr-1" />
              View Details
            </Button>
          </div>
        )}
      </TarotCardContent>
    </TarotCard>
  )
}
