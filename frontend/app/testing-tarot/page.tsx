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
  Circle
} from "lucide-react"

const tarotCards = [
  { 
    name: "The Fool", 
    symbol: "♈", 
    color: "var(--zodiac-aries)", 
    meaning: "New Beginnings",
    position: { x: 10, y: 20 },
    shape: "circle"
  },
  { 
    name: "The Magician", 
    symbol: "♉", 
    color: "var(--zodiac-taurus)", 
    meaning: "Manifestation",
    position: { x: 30, y: 15 },
    shape: "triangle"
  },
  { 
    name: "The High Priestess", 
    symbol: "♊", 
    color: "var(--zodiac-gemini)", 
    meaning: "Intuition",
    position: { x: 50, y: 25 },
    shape: "hexagon"
  },
  { 
    name: "The Emperor", 
    symbol: "♋", 
    color: "var(--zodiac-cancer)", 
    meaning: "Authority",
    position: { x: 70, y: 20 },
    shape: "square"
  },
  { 
    name: "The Star", 
    symbol: "♌", 
    color: "var(--zodiac-leo)", 
    meaning: "Hope",
    position: { x: 90, y: 30 },
    shape: "circle"
  },
]

const portfolioData = [
  { 
    symbol: "AAPL", 
    name: "Apple Inc.", 
    price: 175.43, 
    change: 2.34, 
    card: "The Magician",
    prediction: "Strong upward momentum",
    confidence: 85
  },
  { 
    symbol: "TSLA", 
    name: "Tesla Inc.", 
    price: 248.50, 
    change: -5.67, 
    card: "The Tower",
    prediction: "Volatile period ahead",
    confidence: 72
  },
  { 
    symbol: "GOOGL", 
    name: "Alphabet Inc.", 
    price: 142.89, 
    change: 1.23, 
    card: "The Star",
    prediction: "Bright future prospects",
    confidence: 91
  },
  { 
    symbol: "MSFT", 
    name: "Microsoft Corp.", 
    price: 378.85, 
    change: 3.45, 
    card: "The Emperor",
    prediction: "Stable leadership position",
    confidence: 88
  },
]

const getShapeIcon = (shape: string) => {
  switch (shape) {
    case "circle": return Circle
    case "triangle": return Triangle
    case "square": return Square
    case "hexagon": return Hexagon
    default: return Circle
  }
}

export default function TarotTestingPage() {
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
            Tarot Trading Oracle
          </h1>
          <p className="text-muted-foreground text-lg">
            Divine guidance for your investments
          </p>
        </motion.div>
      </div>

      {/* Tarot Spread */}
      <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Celtic Cross Spread</h2>
          </div>
          
          <div className="relative h-96 bg-gradient-to-br from-background via-card to-background rounded-lg overflow-hidden">
            {/* Tarot Card Positions */}
            {tarotCards.map((card, index) => {
              const ShapeIcon = getShapeIcon(card.shape)
              return (
                <motion.div
                  key={card.name}
                  initial={{ opacity: 0, scale: 0, rotate: -180 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: index * 0.3, duration: 0.8 }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${card.position.x}%`,
                    top: `${card.position.y}%`,
                  }}
                >
                  <div className="relative group">
                    <motion.div 
                      className="w-20 h-28 bg-card border-2 border-primary/30 rounded-lg shadow-lg flex flex-col items-center justify-center p-2 cursor-pointer hover:scale-110 transition-all duration-300"
                      whileHover={{ rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg mb-2"
                        style={{ backgroundColor: card.color }}
                      >
                        {card.symbol}
                      </div>
                      <div className="text-center">
                        <h3 className="text-xs font-semibold text-foreground">{card.name}</h3>
                        <p className="text-xs text-muted-foreground">{card.meaning}</p>
                      </div>
                    </motion.div>
                    
                    {/* Card Glow Effect */}
                    <div 
                      className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-cosmic-glow"
                      style={{ backgroundColor: card.color }}
                    />
                  </div>
                </motion.div>
              )
            })}

            {/* Mystical Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Geometric Patterns */}
              <div className="absolute top-4 left-4 w-16 h-16 border-2 border-primary/20 rotate-45" />
              <div className="absolute top-4 right-4 w-12 h-12 border-2 border-secondary/20 rounded-full" />
              <div className="absolute bottom-4 left-4 w-20 h-20 border-2 border-accent/20" />
              <div className="absolute bottom-4 right-4 w-14 h-14 border-2 border-primary/20 rotate-45" />
              
              {/* Floating Particles */}
              {Array.from({ length: 15 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-accent rounded-full animate-twinkle"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Portfolio Predictions */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Moon className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold">Portfolio Divination</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portfolioData.map((stock, index) => (
            <motion.div
              key={stock.symbol}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
            >
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{stock.symbol}</h3>
                        <p className="text-sm text-muted-foreground">{stock.name}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: stock.change >= 0 ? "var(--zodiac-taurus)" : "var(--zodiac-aries)",
                        color: stock.change >= 0 ? "var(--zodiac-taurus)" : "var(--zodiac-aries)"
                      }}
                    >
                      {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}%
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">${stock.price}</span>
                      <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Live</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">Tarot Card: {stock.card}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{stock.prediction}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary"
                            style={{ width: `${stock.confidence}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">{stock.confidence}% confidence</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Divine Trade
                    </Button>
                    <Button size="sm" variant="outline">
                      <Zap className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mystical Stats */}
      <Card className="p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Circle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">The Fool</h3>
            <p className="text-sm text-muted-foreground">New opportunities detected</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
              <Triangle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">The Magician</h3>
            <p className="text-sm text-muted-foreground">Manifestation energy high</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
              <Hexagon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">The Star</h3>
            <p className="text-sm text-muted-foreground">Hope and guidance present</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Square className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">The Emperor</h3>
            <p className="text-sm text-muted-foreground">Stability and authority</p>
          </div>
        </div>
      </Card>
    </div>
  )
}