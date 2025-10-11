"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, Sparkles, Moon, Sun } from "lucide-react"
import { useState } from "react"

export default function WelcomeScreen() {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleGetStarted = () => {
    setIsAnimating(true)
    window.location.href = "/onboarding"
  }

  const handleDemoMode = () => {
    setIsAnimating(true)
    // Enable demo mode and redirect to onboarding
    localStorage.setItem("zenTraderDemoMode", "true")
    window.location.href = "/onboarding?mode=demo"
  }

  return (
    <div className="h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-2 h-2 bg-accent rounded-full animate-pulse" />
        <div className="absolute top-40 right-16 w-1 h-1 bg-secondary rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-32 left-20 w-1.5 h-1.5 bg-accent rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-20 right-10 w-1 h-1 bg-primary rounded-full animate-pulse delay-500" />
        <div className="absolute top-60 left-1/2 w-1 h-1 bg-secondary rounded-full animate-pulse delay-1000" />
      </div>

      {/* Main Content */}
      <div className="text-center space-y-8 w-full max-w-2xl mx-auto relative z-10">
        {/* Logo Section */}
        <div className="space-y-4">
          <div className="relative">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg">
              <div className="relative">
                <Star className="w-8 h-8 text-white" fill="currentColor" />
                <Sparkles
                  className={`w-4 h-4 text-accent absolute -top-1 -right-1 transition-transform duration-500 ${isAnimating ? "scale-150 rotate-180" : ""}`}
                />
              </div>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl -z-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              ZEN Traders
            </h1>
            <p className="text-muted-foreground text-lg font-medium">Where Markets Meet Your Stars</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                <Moon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Zodiac-aligned stock recommendations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-sm text-muted-foreground">Daily cosmic market insights</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                <Sun className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Mystical portfolio tracking</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* <Button
            onClick={handleGetStarted}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
            disabled={isAnimating}
          >
            {isAnimating ? (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Aligning your stars...
              </div>
            ) : (
              "Begin Your Cosmic Journey"
            )}
          </Button> */}

          <Button
            onClick={handleDemoMode}
            variant="outline"
            className="w-full border-accent/50 text-accent hover:bg-accent/10 bg-transparent font-medium py-4 rounded-xl"
            disabled={isAnimating}
          >
            <Star className="w-4 h-4 mr-2" />
            Try Demo (Virgo)
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-primary/30 text-primary hover:bg-primary/10 bg-transparent"
              onClick={() => window.location.href = "/signup"}
            >
              Sign Up
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-secondary/30 text-secondary hover:bg-secondary/10 bg-transparent"
              onClick={() => window.location.href = "/login"}
            >
              Log In
            </Button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground/70 mt-8">
          Discover your trading destiny through the wisdom of the stars
        </p>
      </div>
    </div>
  )
}
