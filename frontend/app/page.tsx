"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { Star, Sparkles, Moon, Sun, AlertTriangle, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { checkApiHealth } from "@/lib/api/health"
import { setDemoMode } from "@/lib/demo-mode"

export default function WelcomeScreen() {
  const [isAnimating, setIsAnimating] = useState(false)
  const [apiUnavailable, setApiUnavailable] = useState(false)
  const [isCheckingApi, setIsCheckingApi] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  const handleGetStarted = () => {
    setIsAnimating(true)
    window.location.href = "/onboarding"
  }

  const handleDemoMode = () => {
    setIsAnimating(true)
    // Enable demo mode and redirect to onboarding
    setDemoMode(true)
    window.location.href = "/onboarding?mode=demo"
  }

  // Check API health on component mount with lazy loading
  useEffect(() => {
    const checkApi = async () => {
      try {
        const { isHealthy } = await checkApiHealth()
        setApiUnavailable(!isHealthy)
        
        // Auto-enable demo mode if API is unavailable
        if (!isHealthy) {
          setDemoMode(true)
        }
      } catch (error) {
        console.error('Failed to check API health:', error)
        setApiUnavailable(true)
        setDemoMode(true)
      } finally {
        setIsCheckingApi(false)
        // Add a small delay to prevent immediate clicking
        setTimeout(() => setIsLoaded(true), 1000)
      }
    }

    checkApi()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-primary/5 dark:via-background dark:to-secondary/5 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Enhanced cosmic background */}
      <div className="absolute inset-0 bg-stars opacity-20 dark:opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-aurora" />
      
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      {/* API Unavailable Warning Banner */}
      {!isCheckingApi && apiUnavailable && (
        <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-2xl animate-fade-in-down">
          <Card className="p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/5 border-orange-500/30 backdrop-blur-sm glass">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0 animate-pulse" />
              <div className="flex-1 space-y-2">
                <h3 className="font-semibold text-orange-600 dark:text-orange-400">
                  No API Found - Demo Mode Active
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  You're using the demo application with limited functionality. For full access with real-time data and authentication, run locally from:
                </p>
                <a
                  href="https://github.com/AndrewPBerg/ZEN-Trading/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors hover:scale-105"
                >
                  <ExternalLink className="w-3 h-3" />
                  GitHub Repository
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}
      
      {/* Enhanced Cosmic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-3 h-3 bg-accent rounded-full animate-twinkle shadow-cosmic" />
        <div className="absolute top-40 right-16 w-2 h-2 bg-secondary rounded-full animate-float-gentle shadow-cosmic" />
        <div className="absolute bottom-32 left-20 w-2.5 h-2.5 bg-accent rounded-full animate-shimmer shadow-cosmic" />
        <div className="absolute bottom-20 right-10 w-2 h-2 bg-primary rounded-full animate-pulse-slow shadow-cosmic" />
        <div className="absolute top-60 left-1/2 w-1.5 h-1.5 bg-secondary rounded-full animate-twinkle delay-1000 shadow-cosmic" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-accent rounded-full animate-float-gentle delay-500" />
        <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-primary rounded-full animate-shimmer delay-700" />
      </div>

      {/* Main Content */}
      <div className="text-center space-y-8 w-full max-w-2xl mx-auto relative z-10 animate-fade-in-up">
        {/* Enhanced Logo Section */}
        <div className="space-y-6">
          <div className="relative">
            <div className="w-28 h-28 mx-auto bg-cosmic-gradient rounded-full flex items-center justify-center shadow-cosmic-lg animate-cosmic-pulse">
              <div className="relative">
                <Star className="w-10 h-10 text-white drop-shadow-lg" fill="currentColor" />
                <Sparkles
                  className={`w-5 h-5 text-accent absolute -top-1 -right-1 transition-all duration-500 ${isAnimating ? "scale-150 rotate-180" : "animate-twinkle"}`}
                />
              </div>
            </div>
            {/* Orbiting elements */}
            <div className="absolute inset-0 animate-spin-slow">
              <div className="absolute top-0 left-1/2 w-1 h-1 bg-accent rounded-full -translate-x-1/2 animate-pulse" />
            </div>
            <div className="absolute inset-0 animate-spin-slow" style={{ animationDirection: 'reverse', animationDuration: '4s' }}>
              <div className="absolute bottom-0 left-1/2 w-1 h-1 bg-secondary rounded-full -translate-x-1/2 animate-pulse delay-1000" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-5xl font-bold cosmic-text animate-gradient-shift">
              ZEN Traders
            </h1>
            <p className="text-muted-foreground text-xl font-medium">Where Markets Meet Your Stars</p>
            <div className="flex justify-center items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Cosmic Trading Platform</span>
              <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-500" />
            </div>
          </div>
        </div>

        {/* Enhanced Feature Highlights */}
        <Card className="p-8 bg-card/90 backdrop-blur-md border-primary/30 glass card-hover animate-fade-in-up">
          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center group-hover:bg-primary/30 transition-colors duration-300">
                <Moon className="w-5 h-5 text-primary animate-float-gentle" />
              </div>
              <span className="text-base text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Zodiac-aligned stock recommendations
              </span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center group-hover:bg-secondary/30 transition-colors duration-300">
                <Star className="w-5 h-5 text-secondary animate-twinkle" />
              </div>
              <span className="text-base text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Daily cosmic market insights
              </span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center group-hover:bg-accent/30 transition-colors duration-300">
                <Sun className="w-5 h-5 text-accent animate-pulse-slow" />
              </div>
              <span className="text-base text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                Mystical portfolio tracking
              </span>
            </div>
          </div>
        </Card>

        {/* Enhanced Action Buttons */}
        <div className="space-y-6 animate-fade-in-up">
          <Button
            onClick={handleDemoMode}
            variant="cosmic"
            size="lg"
            className="w-full"
            disabled={isAnimating}
          >
            <Star className="w-5 h-5 mr-3 animate-twinkle" />
            {isAnimating ? (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Aligning your stars...
              </div>
            ) : (
              "Try Demo (Virgo)"
            )}
          </Button>

          {/* Only show auth buttons if API is available and component is loaded */}
          {!apiUnavailable && isLoaded && (
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1 border-primary/40 text-primary hover:bg-primary/10 bg-transparent glass hover:border-primary/60 transition-all duration-300 hover:scale-105 py-4 rounded-xl"
                onClick={() => window.location.href = "/signup"}
              >
                <Moon className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-secondary/40 text-secondary hover:bg-secondary/10 bg-transparent glass hover:border-secondary/60 transition-all duration-300 hover:scale-105 py-4 rounded-xl"
                onClick={() => window.location.href = "/login"}
              >
                <Sun className="w-4 h-4 mr-2" />
                Log In
              </Button>
            </div>
          )}
          
          {/* Enhanced loading state while checking API */}
          {isCheckingApi && (
            <div className="flex items-center justify-center gap-3 text-muted-foreground animate-pulse">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-base font-medium">Checking cosmic connection...</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
