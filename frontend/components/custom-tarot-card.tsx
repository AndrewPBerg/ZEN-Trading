"use client"

import { useState } from "react"
import {
  TarotCard,
  TarotCardHeader,
  TarotCardTitle,
  TarotCardContent,
  TarotCardFooter,
  TarotCorners,
} from "@/components/ui/tarot-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Sparkles, Shuffle } from "lucide-react"

// Custom tarot card data for users
const customTarotCards = [
  {
    id: 1,
    title: "The Cosmic Trader",
    symbol: "⭐",
    element: "Ether",
    meaning: "Divine guidance in financial decisions",
    description:
      "You possess an innate ability to sense market movements through cosmic intuition. Trust your mystical instincts when making investment choices.",
    advice: "The stars align to bring prosperity through patient, mindful trading.",
    colors: "from-purple-500/20 to-gold-500/20",
    rarity: "Legendary",
  },
  {
    id: 2,
    title: "The Zodiac Investor",
    symbol: "♌",
    element: "Fire",
    meaning: "Passionate pursuit of wealth",
    description:
      "Your fiery nature drives bold investment strategies. Channel your Leo energy into premium stocks and luxury market sectors.",
    advice: "Shine bright in your choices - quality investments reflect your royal nature.",
    colors: "from-orange-500/20 to-red-500/20",
    rarity: "Epic",
  },
  {
    id: 3,
    title: "The Mystic Analyst",
    symbol: "🔮",
    element: "Water",
    meaning: "Deep intuitive market insight",
    description:
      "You see beyond surface trends into the hidden currents of market psychology. Your emotional intelligence guides profitable decisions.",
    advice: "Dive deep into research - your intuition reveals what others miss.",
    colors: "from-blue-500/20 to-purple-500/20",
    rarity: "Rare",
  },
  {
    id: 4,
    title: "The Stellar Navigator",
    symbol: "🌟",
    element: "Air",
    meaning: "Swift adaptation to market winds",
    description:
      "Like the wind, you move quickly through changing market conditions. Your agility in trading brings consistent gains.",
    advice: "Stay flexible and ready to pivot - the cosmic winds favor the adaptable.",
    colors: "from-cyan-500/20 to-blue-500/20",
    rarity: "Epic",
  },
  {
    id: 5,
    title: "The Earth Guardian",
    symbol: "🌱",
    element: "Earth",
    meaning: "Grounded wealth building",
    description:
      "Your practical approach to investing creates lasting financial foundations. Steady growth through sustainable choices defines your path.",
    advice: "Plant seeds of investment today for tomorrow's abundant harvest.",
    colors: "from-green-500/20 to-emerald-500/20",
    rarity: "Common",
  },
]

export function CustomTarotCard() {
  const [currentCard, setCurrentCard] = useState(customTarotCards[0])
  const [isDrawing, setIsDrawing] = useState(false)

  const drawNewCard = async () => {
    setIsDrawing(true)
    // Simulate card drawing animation
    await new Promise((resolve) => setTimeout(resolve, 1500))
    const randomCard = customTarotCards[Math.floor(Math.random() * customTarotCards.length)]
    setCurrentCard(randomCard)
    setIsDrawing(false)
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "text-yellow-500 border-yellow-500/50"
      case "Epic":
        return "text-purple-500 border-purple-500/50"
      case "Rare":
        return "text-blue-500 border-blue-500/50"
      default:
        return "text-gray-500 border-gray-500/50"
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
          Your Personal Tarot Card
        </h2>
        <p className="text-sm text-muted-foreground">Discover your cosmic trading archetype</p>
      </div>

      <div className="flex justify-center">
        <div className="relative">
          <TarotCard
            className={`w-64 h-96 bg-gradient-to-br ${currentCard.colors} ${isDrawing ? "animate-pulse scale-105" : "hover:scale-105"} transition-all duration-500`}
          >
            <TarotCorners />

            <TarotCardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge className={`text-xs px-2 py-1 ${getRarityColor(currentCard.rarity)}`}>
                  {currentCard.rarity}
                </Badge>
                <div className="text-2xl">{currentCard.symbol}</div>
              </div>
              <TarotCardTitle>{currentCard.title}</TarotCardTitle>
            </TarotCardHeader>

            <TarotCardContent>
              <div className="text-center space-y-4">
                <div className="text-6xl opacity-80">{currentCard.symbol}</div>

                <div className="space-y-2">
                  <Badge variant="outline" className="text-xs">
                    {currentCard.element} Element
                  </Badge>
                  <p className="text-sm font-medium text-accent">{currentCard.meaning}</p>
                </div>

                <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
                  <p>{currentCard.description}</p>
                </div>
              </div>
            </TarotCardContent>

            <TarotCardFooter>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-2">
                  <Star className="w-3 h-3 text-accent" fill="currentColor" />
                  <span className="text-xs font-medium text-accent">Cosmic Guidance</span>
                  <Star className="w-3 h-3 text-accent" fill="currentColor" />
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">"{currentCard.advice}"</p>
              </div>
            </TarotCardFooter>
          </TarotCard>

          {/* Mystical glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-primary/20 rounded-lg blur-xl -z-10 opacity-50" />
        </div>
      </div>

      <div className="text-center">
        <Button
          onClick={drawNewCard}
          disabled={isDrawing}
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          {isDrawing ? (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 animate-spin" />
              Drawing your cosmic card...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Shuffle className="w-4 h-4" />
              Draw New Card
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
