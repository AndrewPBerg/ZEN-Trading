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
  Waves,
  Wind,
  Flame,
  Mountain
} from "lucide-react"

const planets = [
  { name: "Mercury", symbol: "☿", color: "var(--zodiac-gemini)", size: 0.8, speed: 1.2 },
  { name: "Venus", symbol: "♀", color: "var(--zodiac-libra)", size: 1.0, speed: 0.8 },
  { name: "Earth", symbol: "⊕", color: "var(--zodiac-taurus)", size: 1.0, speed: 1.0 },
  { name: "Mars", symbol: "♂", color: "var(--zodiac-aries)", size: 0.9, speed: 1.1 },
  { name: "Jupiter", symbol: "♃", color: "var(--zodiac-sagittarius)", size: 1.5, speed: 0.6 },
  { name: "Saturn", symbol: "♄", color: "var(--zodiac-capricorn)", size: 1.2, speed: 0.7 },
  { name: "Uranus", symbol: "♅", color: "var(--zodiac-aquarius)", size: 1.1, speed: 0.9 },
  { name: "Neptune", symbol: "♆", color: "var(--zodiac-pisces)", size: 1.1, speed: 0.8 },
]

const cosmicData = [
  { 
    symbol: "AAPL", 
    name: "Apple Inc.", 
    price: 175.43, 
    change: 2.34, 
    planet: "Mercury",
    energy: "Communication",
    phase: "Waxing"
  },
  { 
    symbol: "TSLA", 
    name: "Tesla Inc.", 
    price: 248.50, 
    change: -5.67, 
    planet: "Mars",
    energy: "Action",
    phase: "Waning"
  },
  { 
    symbol: "GOOGL", 
    name: "Alphabet Inc.", 
    price: 142.89, 
    change: 1.23, 
    planet: "Uranus",
    energy: "Innovation",
    phase: "Waxing"
  },
  { 
    symbol: "MSFT", 
    name: "Microsoft Corp.", 
    price: 378.85, 
    change: 3.45, 
    planet: "Saturn",
    energy: "Structure",
    phase: "Full"
  },
  { 
    symbol: "AMZN", 
    name: "Amazon.com Inc.", 
    price: 155.12, 
    change: -2.11, 
    planet: "Neptune",
    energy: "Intuition",
    phase: "New"
  },
  { 
    symbol: "NVDA", 
    name: "NVIDIA Corp.", 
    price: 875.28, 
    change: 12.45, 
    planet: "Jupiter",
    energy: "Expansion",
    phase: "Waxing"
  },
]

const getPlanetIcon = (planet: string) => {
  switch (planet) {
    case "Mercury": return Wind
    case "Venus": return Sparkles
    case "Earth": return Mountain
    case "Mars": return Flame
    case "Jupiter": return Star
    case "Saturn": return Hexagon
    case "Uranus": return Compass
    case "Neptune": return Waves
    default: return Star
  }
}

const getPhaseColor = (phase: string) => {
  switch (phase) {
    case "New": return "var(--zodiac-scorpio)"
    case "Waxing": return "var(--zodiac-gemini)"
    case "Full": return "var(--zodiac-leo)"
    case "Waning": return "var(--zodiac-capricorn)"
    default: return "var(--primary)"
  }
}

export default function CosmicTestingPage() {
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
            Cosmic Trading Universe
          </h1>
          <p className="text-muted-foreground text-lg">
            Navigate the celestial markets with planetary wisdom
          </p>
        </motion.div>
      </div>

      {/* Solar System */}
      <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Orbit className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Planetary Alignment</h2>
          </div>
          
          <div className="relative h-96 bg-gradient-to-br from-background via-card to-background rounded-lg overflow-hidden">
            {/* Central Sun */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center animate-cosmic-pulse">
              <Sun className="w-8 h-8 text-white" />
            </div>

            {/* Planetary Orbits */}
            {planets.map((planet, index) => {
              const angle = (index * 45) * (Math.PI / 180)
              const radius = 80 + (index * 15)
              const x = 50 + (radius * Math.cos(angle)) / 2
              const y = 50 + (radius * Math.sin(angle)) / 2
              const PlanetIcon = getPlanetIcon(planet.name)
              
              return (
                <motion.div
                  key={planet.name}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                  }}
                >
                  <motion.div 
                    className="relative group cursor-pointer"
                    animate={{ 
                      rotate: 360,
                      x: Math.cos(angle) * 5,
                      y: Math.sin(angle) * 5
                    }}
                    transition={{ 
                      duration: 20 / planet.speed,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg animate-cosmic-glow"
                      style={{ 
                        backgroundColor: planet.color,
                        width: `${12 * planet.size}px`,
                        height: `${12 * planet.size}px`
                      }}
                    >
                      {planet.symbol}
                    </div>
                    
                    {/* Planet Name */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-card/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
                        {planet.name}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })}

            {/* Orbital Paths */}
            <svg className="absolute inset-0 w-full h-full">
              {planets.map((planet, index) => {
                const radius = 80 + (index * 15)
                return (
                  <circle
                    key={planet.name}
                    cx="50%"
                    cy="50%"
                    r={`${radius / 2}%`}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="1"
                    opacity="0.2"
                    strokeDasharray="5,5"
                  />
                )
              })}
            </svg>

            {/* Cosmic Dust */}
            {Array.from({ length: 30 }).map((_, i) => (
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
      </Card>

      {/* Cosmic Market */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Star className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold">Planetary Market Influence</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cosmicData.map((stock, index) => {
            const planet = planets.find(p => p.name === stock.planet)
            const PlanetIcon = getPlanetIcon(stock.planet)
            
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
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg animate-cosmic-pulse"
                          style={{ backgroundColor: planet?.color }}
                        >
                          {planet?.symbol}
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
                          <PlanetIcon className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">{stock.planet} Influence</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-secondary" />
                          <span className="text-sm text-muted-foreground">{stock.energy} Energy</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" style={{ color: getPhaseColor(stock.phase) }} />
                          <span className="text-sm text-muted-foreground">{stock.phase} Phase</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                      >
                        <Target className="w-4 h-4 mr-2" />
                        Cosmic Trade
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

      {/* Cosmic Stats */}
      <Card className="p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-cosmic-pulse">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Solar Energy</h3>
            <p className="text-sm text-muted-foreground">High solar activity boosting tech sector</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center animate-cosmic-pulse">
              <Moon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Lunar Cycle</h3>
            <p className="text-sm text-muted-foreground">Waxing moon phase favors growth</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center animate-cosmic-pulse">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Stellar Alignment</h3>
            <p className="text-sm text-muted-foreground">Favorable constellation positions</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center animate-cosmic-pulse">
              <Orbit className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Planetary Motion</h3>
            <p className="text-sm text-muted-foreground">Jupiter's influence on expansion</p>
          </div>
        </div>
      </Card>
    </div>
  )
}