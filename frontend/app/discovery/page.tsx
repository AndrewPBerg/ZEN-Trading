"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { ProtectedRoute } from "@/components/protected-route"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, TrendingUp, TrendingDown, Heart, X, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/use-auth"

interface Stock {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  alignment: number
  element: string
  reason: string
  logo: string
}

const recommendedStocks: Stock[] = [
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    price: 189.25,
    change: 2.45,
    changePercent: 1.31,
    alignment: 92,
    element: "Earth",
    reason: "Virgo energy aligns with Apple's methodical innovation and attention to detail",
    logo: "🍎",
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corp.",
    price: 378.85,
    change: -1.2,
    changePercent: -0.32,
    alignment: 88,
    element: "Earth",
    reason: "Systematic approach to technology resonates with Virgo's analytical nature",
    logo: "🪟",
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.56,
    change: 3.78,
    changePercent: 2.72,
    alignment: 85,
    element: "Air",
    reason: "Information organization and search perfection appeals to Virgo precision",
    logo: "🔍",
  },
  {
    ticker: "NVDA",
    name: "NVIDIA Corp.",
    price: 875.3,
    change: 15.6,
    changePercent: 1.82,
    alignment: 79,
    element: "Fire",
    reason: "Technical excellence in AI chips matches Virgo's pursuit of perfection",
    logo: "🎮",
  },
  {
    ticker: "TSLA",
    name: "Tesla Inc.",
    price: 248.42,
    change: -4.33,
    changePercent: -1.71,
    alignment: 76,
    element: "Air",
    reason: "Sustainable innovation and efficiency align with Virgo values",
    logo: "⚡",
  },
  {
    ticker: "META",
    name: "Meta Platforms",
    price: 484.2,
    change: 8.9,
    changePercent: 1.87,
    alignment: 73,
    element: "Air",
    reason: "Connecting people systematically resonates with Virgo's service nature",
    logo: "📱",
  },
]

function DiscoveryPageContent() {
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [likedStocks, setLikedStocks] = useState<string[]>([])
  const [dislikedStocks, setDislikedStocks] = useState<string[]>([])
  const [isAnimating, setIsAnimating] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  const handleDragStart = (clientX: number, clientY: number) => {
    if (isAnimating) return
    setIsDragging(true)
    setStartPos({ x: clientX, y: clientY })
  }

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || isAnimating) return

    const deltaX = clientX - startPos.x
    const deltaY = clientY - startPos.y

    setDragOffset({ x: deltaX, y: deltaY })
  }

  const handleDragEnd = () => {
    if (!isDragging || isAnimating) return

    const threshold = 100
    const absX = Math.abs(dragOffset.x)

    if (absX > threshold) {
      if (dragOffset.x > 0) {
        handleLike()
      } else {
        handleDislike()
      }
    } else {
      // Spring back animation
      setDragOffset({ x: 0, y: 0 })
    }

    setIsDragging(false)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    handleDragStart(e.clientX, e.clientY)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX, e.clientY)
  }

  const handleMouseUp = () => {
    handleDragEnd()
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleDragStart(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    handleDragMove(touch.clientX, touch.clientY)
  }

  const handleTouchEnd = () => {
    handleDragEnd()
  }

  const handleLike = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setSwipeDirection("right")

    setTimeout(() => {
      const currentStock = recommendedStocks[currentIndex]
      setLikedStocks((prev) => [...prev, currentStock.ticker])
      nextCard()
    }, 300)
  }

  const handleDislike = () => {
    if (isAnimating) return
    setIsAnimating(true)
    setSwipeDirection("left")

    setTimeout(() => {
      const currentStock = recommendedStocks[currentIndex]
      setDislikedStocks((prev) => [...prev, currentStock.ticker])
      nextCard()
    }, 300)
  }

  const nextCard = () => {
    if (currentIndex < recommendedStocks.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setIsAnimating(false)
      setSwipeDirection(null)
      setDragOffset({ x: 0, y: 0 })
    } else {
      setIsAnimating(false)
      setSwipeDirection(null)
      setDragOffset({ x: 0, y: 0 })
    }
  }

  const currentStock = recommendedStocks[currentIndex]
  const isFinished = currentIndex >= recommendedStocks.length

  const rotation = isDragging ? dragOffset.x * 0.1 : 0
  const opacity = isDragging ? Math.max(0.7, 1 - Math.abs(dragOffset.x) * 0.002) : 1
  const scale = isDragging ? Math.max(0.95, 1 - Math.abs(dragOffset.x) * 0.0005) : 1

  return (
    <div className="h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 overflow-hidden flex flex-col">
      <Navigation />

      {/* Header */}
      <div className="px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Discovery</h1>
            <p className="text-sm text-muted-foreground">Curated for {user?.first_name || "User"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30">
              <Star className="w-3 h-3 mr-1" />
              {user?.username || "Trader"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Cosmic Insight Card */}
      <div className="px-6 py-2 flex-shrink-0">
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1 text-sm">Today's Cosmic Insight</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Virgo energy is strong today! Your analytical nature will help you spot undervalued opportunities.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex-1 px-6 flex items-center justify-center overflow-hidden">
        {!isFinished ? (
          <div className="w-full max-w-lg">
            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-4">
              <div className="flex gap-2">
                {recommendedStocks.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? "bg-accent scale-125"
                        : index < currentIndex
                          ? "bg-primary/50"
                          : "bg-muted"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Stock Card with Swipe Animation */}
            <div className="relative">
              <Card
                className={`p-6 bg-card/90 backdrop-blur-sm border-primary/20 shadow-2xl cursor-grab active:cursor-grabbing select-none transition-all duration-300 ${
                  isAnimating && swipeDirection === "right"
                    ? "transform translate-x-full rotate-12 opacity-0"
                    : isAnimating && swipeDirection === "left"
                      ? "transform -translate-x-full -rotate-12 opacity-0"
                      : ""
                }`}
                style={{
                  transform: !isAnimating
                    ? `translateX(${dragOffset.x}px) translateY(${dragOffset.y * 0.1}px) rotate(${rotation}deg) scale(${scale})`
                    : undefined,
                  opacity: !isAnimating ? opacity : undefined,
                  transition: isDragging ? "none" : "all 0.3s ease-out",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={isDragging ? handleMouseMove : undefined}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                    {currentStock.logo}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-foreground">{currentStock.ticker}</h2>
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        currentStock.element === "Earth"
                          ? "bg-green-500/20 text-green-400"
                          : currentStock.element === "Air"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {currentStock.element}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3 text-sm">{currentStock.name}</p>

                  <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-foreground">${currentStock.price}</p>
                    <div
                      className={`flex items-center justify-center gap-1 text-sm ${
                        currentStock.change >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {currentStock.change >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {currentStock.change >= 0 ? "+" : ""}
                      {currentStock.changePercent}%
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Cosmic Alignment</span>
                    <span className="text-xs font-medium text-accent">{currentStock.alignment}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-500"
                      style={{ width: `${currentStock.alignment}%` }}
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground text-center leading-relaxed mb-6">{currentStock.reason}</p>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={handleDislike}
                    disabled={isAnimating || isDragging}
                    className="w-14 h-14 rounded-full bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200 hover:scale-110"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleLike}
                    disabled={isAnimating || isDragging}
                    className="w-14 h-14 rounded-full bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-400 hover:text-green-300 transition-all duration-200 hover:scale-110"
                  >
                    <Heart className="w-6 h-6" />
                  </Button>
                </div>
              </Card>

              {isDragging && Math.abs(dragOffset.x) > 50 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`absolute inset-0 rounded-lg transition-opacity duration-150 ${
                      dragOffset.x > 0
                        ? "bg-green-500/20 border-2 border-green-500/50"
                        : "bg-red-500/20 border-2 border-red-500/50"
                    }`}
                    style={{ opacity: Math.min(0.8, Math.abs(dragOffset.x) / 150) }}
                  />
                  <div
                    className={`text-6xl font-bold z-10 ${dragOffset.x > 0 ? "text-green-400" : "text-red-400"}`}
                    style={{
                      opacity: Math.min(1, Math.abs(dragOffset.x) / 100),
                      transform: `rotate(${dragOffset.x > 0 ? "12deg" : "-12deg"})`,
                    }}
                  >
                    {dragOffset.x > 0 ? "❤️" : "✕"}
                  </div>
                </div>
              )}

              {/* Swipe Indicators */}
              {isAnimating && (
                <div
                  className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                    swipeDirection === "right" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  <div
                    className={`text-6xl font-bold opacity-80 transform ${
                      swipeDirection === "right" ? "rotate-12" : "-rotate-12"
                    }`}
                  >
                    {swipeDirection === "right" ? "❤️" : "✕"}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-3">All Done!</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              You've reviewed all recommendations. Check your liked stocks in your watchlist!
            </p>
            <div className="space-y-1 mb-4">
              <p className="text-xs text-green-400">❤️ Liked: {likedStocks.length} stocks</p>
              <p className="text-xs text-red-400">✕ Passed: {dislikedStocks.length} stocks</p>
            </div>
            <Button
              onClick={() => {
                setCurrentIndex(0)
                setLikedStocks([])
                setDislikedStocks([])
              }}
              size="sm"
            >
              Start Over
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DiscoveryPage() {
  return (
    <ProtectedRoute>
      <DiscoveryPageContent />
    </ProtectedRoute>
  )
}
