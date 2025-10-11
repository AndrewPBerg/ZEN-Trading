"use client"

import { CustomTarotCard } from "@/components/custom-tarot-card"
import { TarotCard, TarotCardContent, TarotCorners } from "@/components/ui/tarot-card"
import { Badge } from "@/components/ui/badge"
import { Moon, Star, Sparkles } from "lucide-react"

export default function TarotPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-20 pb-8">
      {/* Cosmic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-8 w-1 h-1 bg-accent rounded-full animate-pulse" />
        <div className="absolute top-40 right-12 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-primary rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-20 right-8 w-2 h-2 bg-accent rounded-full animate-pulse delay-700" />
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-secondary rounded-full animate-pulse delay-300" />
      </div>

      <div className="relative z-10 max-w-md mx-auto p-4 space-y-8">
        {/* Header */}
        <div className="text-center pt-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Moon className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Cosmic Tarot
            </h1>
            <Star className="w-6 h-6 text-secondary" fill="currentColor" />
          </div>
          <p className="text-muted-foreground">Discover your mystical trading destiny</p>
        </div>

        {/* Main Tarot Card */}
        <CustomTarotCard />

        {/* Additional Mystical Elements */}
        <div className="grid grid-cols-2 gap-4">
          <TarotCard className="h-32 bg-gradient-to-br from-primary/10 to-accent/10">
            <TarotCorners />
            <TarotCardContent className="flex flex-col items-center justify-center h-full">
              <Sparkles className="w-8 h-8 text-accent mb-2" />
              <p className="text-xs text-center text-muted-foreground">Daily Reading</p>
              <p className="text-sm font-medium text-accent">Coming Soon</p>
            </TarotCardContent>
          </TarotCard>

          <TarotCard className="h-32 bg-gradient-to-br from-secondary/10 to-primary/10">
            <TarotCorners />
            <TarotCardContent className="flex flex-col items-center justify-center h-full">
              <Moon className="w-8 h-8 text-secondary mb-2" />
              <p className="text-xs text-center text-muted-foreground">Card Collection</p>
              <p className="text-sm font-medium text-secondary">5 Cards</p>
            </TarotCardContent>
          </TarotCard>
        </div>

        {/* Mystical Quote */}
        <TarotCard className="bg-gradient-to-r from-accent/5 to-primary/5">
          <TarotCorners />
          <TarotCardContent className="text-center">
            <Star className="w-6 h-6 text-accent mx-auto mb-3" fill="currentColor" />
            <p className="text-sm text-muted-foreground italic leading-relaxed">
              "The cards reveal not your fate, but the cosmic energies that guide your financial journey. Trust in the
              mystical wisdom of the markets."
            </p>
            <Badge variant="outline" className="mt-3 text-xs">
              Ancient Trading Wisdom
            </Badge>
          </TarotCardContent>
        </TarotCard>
      </div>
    </div>
  )
}
