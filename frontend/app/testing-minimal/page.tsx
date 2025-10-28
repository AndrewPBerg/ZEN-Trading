"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Star, 
  Sparkles, 
  Moon, 
  Sun, 
  Zap, 
  Target,
  TrendingUp,
  Activity,
  Compass,
  Orbit,
  Hexagon,
  Triangle,
  Square,
  Circle,
  Diamond,
  Minus,
  Plus,
  ArrowUp,
  ArrowDown
} from "lucide-react"

const minimalistData = [
  { 
    symbol: "AAPL", 
    name: "Apple Inc.", 
    price: 175.43, 
    change: 2.34, 
    sign: "♊",
    element: "Air",
    trend: "up"
  },
  { 
    symbol: "TSLA", 
    name: "Tesla Inc.", 
    price: 248.50, 
    change: -5.67, 
    sign: "♈",
    element: "Fire",
    trend: "down"
  },
  { 
    symbol: "GOOGL", 
    name: "Alphabet Inc.", 
    price: 142.89, 
    change: 1.23, 
    sign: "♒",
    element: "Air",
    trend: "up"
  },
  { 
    symbol: "MSFT", 
    name: "Microsoft Corp.", 
    price: 378.85, 
    change: 3.45, 
    sign: "♑",
    element: "Earth",
    trend: "up"
  },
  { 
    symbol: "AMZN", 
    name: "Amazon.com Inc.", 
    price: 155.12, 
    change: -2.11, 
    sign: "♋",
    element: "Water",
    trend: "down"
  },
  { 
    symbol: "NVDA", 
    name: "NVIDIA Corp.", 
    price: 875.28, 
    change: 12.45, 
    sign: "♌",
    element: "Fire",
    trend: "up"
  },
]

const elementColors = {
  Fire: "var(--zodiac-aries)",
  Earth: "var(--zodiac-taurus)",
  Air: "var(--zodiac-gemini)",
  Water: "var(--zodiac-cancer)"
}

const getElementIcon = (element: string) => {
  switch (element) {
    case "Fire": return Sun
    case "Earth": return Square
    case "Air": return Compass
    case "Water": return Moon
    default: return Star
  }
}

export default function MinimalTestingPage() {
  return (
    <div className="min-h-screen bg-background p-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Minimal Astrology
          </h1>
          <p className="text-muted-foreground text-lg">
            Clean lines, cosmic wisdom
          </p>
        </motion.div>
      </div>

      {/* Element Grid */}
      <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Elemental Balance</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["Fire", "Earth", "Air", "Water"].map((element, index) => {
              const ElementIcon = getElementIcon(element)
              const count = minimalistData.filter(stock => stock.element === element).length
              const percentage = (count / minimalistData.length) * 100
              
              return (
                <motion.div
                  key={element}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="text-center space-y-3"
                >
                  <div 
                    className="w-20 h-20 mx-auto flex items-center justify-center border-2 border-primary/20 hover:border-primary/40 transition-all duration-300"
                    style={{ 
                      clipPath: element === "Fire" ? "polygon(50% 0%, 0% 100%, 100% 100%)" :
                               element === "Earth" ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" :
                               element === "Air" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" :
                               "circle"
                    }}
                  >
                    <ElementIcon className="w-8 h-8" style={{ color: elementColors[element as keyof typeof elementColors] }} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{element}</h3>
                    <p className="text-sm text-muted-foreground">{count} stocks</p>
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: elementColors[element as keyof typeof elementColors]
                        }}
                      />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Minimal Stock Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold">Market Positions</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {minimalistData.map((stock, index) => {
            const ElementIcon = getElementIcon(stock.element)
            
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center border-2 border-primary/20">
                          <span className="text-lg font-bold">{stock.symbol}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{stock.name}</h3>
                          <div className="flex items-center gap-2">
                            <ElementIcon className="w-4 h-4" style={{ color: elementColors[stock.element as keyof typeof elementColors] }} />
                            <span className="text-sm text-muted-foreground">{stock.element}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          {stock.trend === "up" ? (
                            <ArrowUp className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-sm font-medium ${stock.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">${stock.price}</span>
                        <div className="flex items-center gap-1">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Live</span>
                        </div>
                      </div>
                      
                      {/* Zodiac Sign */}
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-6 h-6 flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: elementColors[stock.element as keyof typeof elementColors] }}
                        >
                          {stock.sign}
                        </div>
                        <span className="text-sm text-muted-foreground">Zodiac Influence</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Trade
                      </Button>
                      <Button size="sm" variant="outline">
                        <Zap className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Minimal Stats */}
      <Card className="p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto border-2 border-primary/20 flex items-center justify-center">
              <Sun className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Fire Energy</h3>
            <p className="text-muted-foreground">High volatility, high potential</p>
            <div className="text-2xl font-bold text-primary">2 stocks</div>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto border-2 border-secondary/20 flex items-center justify-center">
              <Square className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold">Earth Stability</h3>
            <p className="text-muted-foreground">Grounded, reliable investments</p>
            <div className="text-2xl font-bold text-secondary">1 stock</div>
          </div>
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto border-2 border-accent/20 flex items-center justify-center">
              <Compass className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold">Air Innovation</h3>
            <p className="text-muted-foreground">Tech-focused, forward-thinking</p>
            <div className="text-2xl font-bold text-accent">2 stocks</div>
          </div>
        </div>
      </Card>
    </div>
  )
}