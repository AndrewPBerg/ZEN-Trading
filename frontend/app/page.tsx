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
    <div className="h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* API Unavailable Warning Banner */}
      {!isCheckingApi && apiUnavailable && (
        <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-2xl">
          <Card className="p-4 bg-gradient-to-r from-orange-500/10 to-yellow-500/5 border-orange-500/30 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
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
                  className="inline-flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  GitHub Repository
                </a>
              </div>
            </div>
          </Card>
        </div>
      )}
      
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
            <div />
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
              <div className="w-8 h-8 bg-primary/20 flex items-center justify-center" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}>
                <Moon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">Zodiac-aligned stock recommendations</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary/20 flex items-center justify-center" style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)" }}>
                <Star className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-sm text-muted-foreground">Daily cosmic market insights</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/20 flex items-center justify-center" style={{ clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" }}>
                <Sun className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground">Mystical portfolio tracking</span>
            </div>
          </div>
        </Card>

        {/* Design Testing Links */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center">Explore New Astrological Designs</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <a 
                href="/testing-constellation" 
                className="p-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-center transition-all duration-300 hover:scale-105"
              >
                <div className="text-sm font-medium">Constellation</div>
                <div className="text-xs text-muted-foreground">Star maps & cosmic grids</div>
              </a>
              <a 
                href="/testing-tarot" 
                className="p-3 bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 rounded-lg text-center transition-all duration-300 hover:scale-105"
              >
                <div className="text-sm font-medium">Tarot Oracle</div>
                <div className="text-xs text-muted-foreground">Divine guidance & cards</div>
              </a>
              <a 
                href="/testing-geometric" 
                className="p-3 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-center transition-all duration-300 hover:scale-105"
              >
                <div className="text-sm font-medium">Geometric</div>
                <div className="text-xs text-muted-foreground">Sharp lines & shapes</div>
              </a>
              <a 
                href="/testing-cosmic" 
                className="p-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-center transition-all duration-300 hover:scale-105"
              >
                <div className="text-sm font-medium">Cosmic Universe</div>
                <div className="text-xs text-muted-foreground">Planets & solar system</div>
              </a>
              <a 
                href="/testing-minimal" 
                className="p-3 bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 rounded-lg text-center transition-all duration-300 hover:scale-105"
              >
                <div className="text-sm font-medium">Minimal</div>
                <div className="text-xs text-muted-foreground">Clean & simple</div>
              </a>
              <a 
                href="/testing-constellation" 
                className="p-3 bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg text-center transition-all duration-300 hover:scale-105"
              >
                <div className="text-sm font-medium">More Coming</div>
                <div className="text-xs text-muted-foreground">Additional designs</div>
              </a>
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

          {/* Only show auth buttons if API is available and component is loaded */}
          {!apiUnavailable && isLoaded && (
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
          )}
          
          {/* Show loading state while checking API */}
          {isCheckingApi && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-sm">Checking connection...</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
