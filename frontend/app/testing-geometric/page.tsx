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
  Diamond
} from "lucide-react"

const zodiacSigns = [
  { name: "Aries", symbol: "♈", element: "Fire", color: "var(--zodiac-aries)", shape: "triangle" },
  { name: "Taurus", symbol: "♉", element: "Earth", color: "var(--zodiac-taurus)", shape: "circle" },
  { name: "Gemini", symbol: "♊", element: "Air", color: "var(--zodiac-gemini)", shape: "diamond" },
  { name: "Cancer", symbol: "♋", element: "Water", color: "var(--zodiac-cancer)", shape: "circle" },
  { name: "Leo", symbol: "♌", element: "Fire", color: "var(--zodiac-leo)", shape: "triangle" },
  { name: "Virgo", symbol: "♍", element: "Earth", color: "var(--zodiac-virgo)", shape: "square" },
  { name: "Libra", symbol: "♎", element: "Air", color: "var(--zodiac-libra)", shape: "diamond" },
  { name: "Scorpio", symbol: "♏", element: "Water", color: "var(--zodiac-scorpio)", shape: "circle" },
  { name: "Sagittarius", symbol: "♐", element: "Fire", color: "var(--zodiac-sagittarius)", shape: "triangle" },
  { name: "Capricorn", symbol: "♑", element: "Earth", color: "var(--zodiac-capricorn)", shape: "square" },
  { name: "Aquarius", symbol: "♒", element: "Air", color: "var(--zodiac-aquarius)", shape: "diamond" },
  { name: "Pisces", symbol: "♓", element: "Water", color: "var(--zodiac-pisces)", shape: "circle" },
]

const marketData = [
  { 
    sector: "Technology", 
    symbol: "AAPL", 
    price: 175.43, 
    change: 2.34, 
    zodiac: "Gemini",
    element: "Air",
    confidence: 85
  },
  { 
    sector: "Automotive", 
    symbol: "TSLA", 
    price: 248.50, 
    change: -5.67, 
    zodiac: "Aries",
    element: "Fire",
    confidence: 72
  },
  { 
    sector: "Technology", 
    symbol: "GOOGL", 
    price: 142.89, 
    change: 1.23, 
    zodiac: "Aquarius",
    element: "Air",
    confidence: 91
  },
  { 
    sector: "Technology", 
    symbol: "MSFT", 
    price: 378.85, 
    change: 3.45, 
    zodiac: "Capricorn",
    element: "Earth",
    confidence: 88
  },
  { 
    sector: "E-commerce", 
    symbol: "AMZN", 
    price: 155.12, 
    change: -2.11, 
    zodiac: "Cancer",
    element: "Water",
    confidence: 76
  },
  { 
    sector: "Technology", 
    symbol: "NVDA", 
    price: 875.28, 
    change: 12.45, 
    zodiac: "Leo",
    element: "Fire",
    confidence: 94
  },
]

const getShapeIcon = (shape: string) => {
  switch (shape) {
    case "circle": return Circle
    case "triangle": return Triangle
    case "square": return Square
    case "diamond": return Diamond
    case "hexagon": return Hexagon
    default: return Circle
  }
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

export default function GeometricTestingPage() {
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
            Geometric Astrology
          </h1>
          <p className="text-muted-foreground text-lg">
            Mathematical precision meets cosmic wisdom
          </p>
        </motion.div>
      </div>

      {/* Zodiac Wheel */}
      <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Zodiac Elements Matrix</h2>
          </div>
          
          <div className="relative h-96 bg-gradient-to-br from-background via-card to-background rounded-lg overflow-hidden">
            {/* Central Circle */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border-2 border-primary/30 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-primary animate-zodiac-rotation" />
            </div>

            {/* Zodiac Signs in Geometric Pattern */}
            {zodiacSigns.map((sign, index) => {
              const angle = (index * 30) * (Math.PI / 180)
              const radius = 120
              const x = 50 + (radius * Math.cos(angle)) / 2
              const y = 50 + (radius * Math.sin(angle)) / 2
              const ShapeIcon = getShapeIcon(sign.shape)
              const ElementIcon = getElementIcon(sign.element)
              
              return (
                <motion.div
                  key={sign.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                >
                  <div className="relative group">
                    <motion.div 
                      className="w-16 h-16 bg-card border-2 border-primary/30 flex flex-col items-center justify-center p-2 cursor-pointer hover:scale-110 transition-all duration-300"
                      whileHover={{ rotate: 5 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ 
                        clipPath: sign.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" :
                                 sign.shape === "diamond" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" :
                                 sign.shape === "square" ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" :
                                 "circle"
                      }}
                    >
                      <div 
                        className="w-6 h-6 flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: sign.color }}
                      >
                        {sign.symbol}
                      </div>
                      <div className="text-center mt-1">
                        <h3 className="text-xs font-semibold text-foreground">{sign.name}</h3>
                        <div className="flex items-center justify-center">
                          <ElementIcon className="w-3 h-3 text-muted-foreground" />
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}

            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="zodiacGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="50%" stopColor="var(--secondary)" />
                  <stop offset="100%" stopColor="var(--accent)" />
                </linearGradient>
              </defs>
              
              {/* Element Groupings */}
              {["Fire", "Earth", "Air", "Water"].map((element, elementIndex) => {
                const elementSigns = zodiacSigns.filter(sign => sign.element === element)
                return elementSigns.map((sign, signIndex) => {
                  const angle = (zodiacSigns.indexOf(sign) * 30) * (Math.PI / 180)
                  const radius = 120
                  const x = 50 + (radius * Math.cos(angle)) / 2
                  const y = 50 + (radius * Math.sin(angle)) / 2
                  
                  if (signIndex < elementSigns.length - 1) {
                    const nextSign = elementSigns[signIndex + 1]
                    const nextAngle = (zodiacSigns.indexOf(nextSign) * 30) * (Math.PI / 180)
                    const nextX = 50 + (radius * Math.cos(nextAngle)) / 2
                    const nextY = 50 + (radius * Math.sin(nextAngle)) / 2
                    
                    return (
                      <line
                        key={`${element}-${signIndex}`}
                        x1={`${x}%`}
                        y1={`${y}%`}
                        x2={`${nextX}%`}
                        y2={`${nextY}%`}
                        stroke="url(#zodiacGradient)"
                        strokeWidth="1"
                        opacity="0.3"
                      />
                    )
                  }
                  return null
                })
              })}
            </svg>
          </div>
        </div>
      </Card>

      {/* Market Grid */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold">Elemental Market Analysis</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {marketData.map((stock, index) => {
            const sign = zodiacSigns.find(s => s.name === stock.zodiac)
            const ShapeIcon = getShapeIcon(sign?.shape || "circle")
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 flex items-center justify-center"
                          style={{ 
                            clipPath: sign?.shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" :
                                     sign?.shape === "diamond" ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" :
                                     sign?.shape === "square" ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" :
                                     "circle",
                            backgroundColor: sign?.color
                          }}
                        >
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{stock.symbol}</h3>
                          <p className="text-sm text-muted-foreground">{stock.sector}</p>
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
                          <ShapeIcon className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{stock.zodiac} Sign</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ElementIcon className="w-4 h-4 text-secondary" />
                          <span className="text-sm text-muted-foreground">{stock.element} Element</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-gradient-to-r from-primary to-secondary"
                              style={{ width: `${stock.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{stock.confidence}%</span>
                        </div>
                      </div>
                    </div>

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

      {/* Elemental Stats */}
      <Card className="p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary flex items-center justify-center" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}>
              <Sun className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Fire Signs</h3>
            <p className="text-sm text-muted-foreground">High energy, volatile markets</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
              <Square className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Earth Signs</h3>
            <p className="text-sm text-muted-foreground">Stable, grounded investments</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent to-primary flex items-center justify-center" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}>
              <Compass className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Air Signs</h3>
            <p className="text-sm text-muted-foreground">Innovative, tech-focused</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <Moon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Water Signs</h3>
            <p className="text-sm text-muted-foreground">Intuitive, emotional markets</p>
          </div>
        </div>
      </Card>
    </div>
  )
}