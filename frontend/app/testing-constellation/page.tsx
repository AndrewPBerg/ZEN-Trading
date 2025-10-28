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
  Orbit
} from "lucide-react"

const constellationData = [
  { name: "Orion", symbol: "♈", color: "var(--zodiac-aries)", x: 20, y: 30 },
  { name: "Ursa Major", symbol: "♉", color: "var(--zodiac-taurus)", x: 60, y: 20 },
  { name: "Cassiopeia", symbol: "♊", color: "var(--zodiac-gemini)", x: 80, y: 40 },
  { name: "Draco", symbol: "♋", color: "var(--zodiac-cancer)", x: 40, y: 60 },
  { name: "Lyra", symbol: "♌", color: "var(--zodiac-leo)", x: 70, y: 70 },
  { name: "Cygnus", symbol: "♍", color: "var(--zodiac-virgo)", x: 30, y: 80 },
]

const stockData = [
  { symbol: "AAPL", name: "Apple Inc.", price: 175.43, change: 2.34, constellation: "Orion" },
  { symbol: "TSLA", name: "Tesla Inc.", price: 248.50, change: -5.67, constellation: "Ursa Major" },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.89, change: 1.23, constellation: "Cassiopeia" },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 378.85, change: 3.45, constellation: "Draco" },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 155.12, change: -2.11, constellation: "Lyra" },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.28, change: 12.45, constellation: "Cygnus" },
]

export default function ConstellationTestingPage() {
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
            Constellation Trading Interface
          </h1>
          <p className="text-muted-foreground text-lg">
            Where stocks align with the stars
          </p>
        </motion.div>
      </div>

      {/* Constellation Map */}
      <Card className="p-8 bg-card/50 backdrop-blur-sm border-primary/20">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Cosmic Market Map</h2>
          </div>
          
          <div className="relative h-96 bg-gradient-to-br from-background via-card to-background rounded-lg overflow-hidden">
            {/* Constellation Lines */}
            <svg className="absolute inset-0 w-full h-full">
              <defs>
                <linearGradient id="constellationGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary)" />
                  <stop offset="50%" stopColor="var(--secondary)" />
                  <stop offset="100%" stopColor="var(--accent)" />
                </linearGradient>
              </defs>
              
              {/* Constellation connections */}
              <line x1="20%" y1="30%" x2="60%" y2="20%" stroke="url(#constellationGradient)" strokeWidth="2" opacity="0.6" />
              <line x1="60%" y1="20%" x2="80%" y2="40%" stroke="url(#constellationGradient)" strokeWidth="2" opacity="0.6" />
              <line x1="80%" y1="40%" x2="40%" y2="60%" stroke="url(#constellationGradient)" strokeWidth="2" opacity="0.6" />
              <line x1="40%" y1="60%" x2="70%" y2="70%" stroke="url(#constellationGradient)" strokeWidth="2" opacity="0.6" />
              <line x1="70%" y1="70%" x2="30%" y2="80%" stroke="url(#constellationGradient)" strokeWidth="2" opacity="0.6" />
              <line x1="30%" y1="80%" x2="20%" y2="30%" stroke="url(#constellationGradient)" strokeWidth="2" opacity="0.6" />
            </svg>

            {/* Constellation Points */}
            {constellationData.map((constellation, index) => (
              <motion.div
                key={constellation.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${constellation.x}%`,
                  top: `${constellation.y}%`,
                }}
              >
                <div className="relative">
                  <div 
                    className="w-8 h-8 rounded-full animate-cosmic-pulse flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: constellation.color }}
                  >
                    {constellation.symbol}
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                      {constellation.name}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Floating Stars */}
            {Array.from({ length: 20 }).map((_, i) => (
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

      {/* Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stockData.map((stock, index) => (
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
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">${stock.price}</span>
                    <div className="flex items-center gap-1">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Live</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Orbit className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Aligned with {stock.constellation}
                    </span>
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
        ))}
      </div>

      {/* Cosmic Stats */}
      <Card className="p-8 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Cosmic Alignment</h3>
            <p className="text-muted-foreground">87% of stocks aligned with favorable constellations</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
              <Moon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Lunar Influence</h3>
            <p className="text-muted-foreground">Waxing moon phase favors growth stocks</p>
          </div>
          
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center">
              <Sun className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold">Solar Energy</h3>
            <p className="text-muted-foreground">High solar activity boosting tech sector</p>
          </div>
        </div>
      </Card>
    </div>
  )
}