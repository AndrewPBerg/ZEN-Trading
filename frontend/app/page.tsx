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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* API Unavailable Warning Banner */}
      {!isCheckingApi && apiUnavailable && (
        <div className="fixed top-20 left-4 right-4 z-50 mx-auto max-w-2xl animate-fade-in-up">
          <Card className="p-6 bg-gradient-to-r from-orange-500/10 to-yellow-500/5 border-orange-500/30 backdrop-blur-xl shadow-xl">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-orange-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <h3 className="font-semibold text-orange-600 dark:text-orange-400 text-lg">
                  No API Found - Demo Mode Active
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-300 leading-relaxed">
                  You're using the demo application with limited functionality. For full access with real-time data and authentication, run locally from:
                </p>
                <a
                  href="https://github.com/AndrewPBerg/ZEN-Trading/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
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
      <div className="text-center space-y-12 w-full max-w-3xl mx-auto relative z-10 animate-fade-in-up">
        {/* Logo Section */}
        <div className="space-y-6">
          <div className="relative">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-2xl animate-float">
              <div className="relative">
                <Star className="w-12 h-12 text-white" fill="currentColor" />
                <Sparkles
                  className={`w-6 h-6 text-accent absolute -top-2 -right-2 transition-all duration-500 ${isAnimating ? "scale-150 rotate-180" : ""}`}
                />
              </div>
            </div>
            <div className="absolute inset-0 w-32 h-32 mx-auto bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-xl animate-pulse-glow" />
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-gradient-x">
              ZEN Traders
            </h1>
            <p className="text-muted-foreground text-xl font-medium">Where Markets Meet Your Stars</p>
          </div>
        </div>

        {/* Feature Highlights */}
        <Card className="p-8 bg-card/90 backdrop-blur-xl border-border/50 shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Moon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-base text-muted-foreground group-hover:text-foreground transition-colors">Zodiac-aligned stock recommendations</span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center group-hover:bg-secondary/30 transition-colors">
                <Star className="w-6 h-6 text-secondary" />
              </div>
              <span className="text-base text-muted-foreground group-hover:text-foreground transition-colors">Daily cosmic market insights</span>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <Sun className="w-6 h-6 text-accent" />
              </div>
              <span className="text-base text-muted-foreground group-hover:text-foreground transition-colors">Mystical portfolio tracking</span>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-6">
          <Button
            onClick={handleDemoMode}
            variant="cosmic"
            size="xl"
            className="w-full"
            disabled={isAnimating}
          >
            <Star className="w-6 h-6 mr-3" />
            Try Demo (Virgo)
          </Button>

          {/* Only show auth buttons if API is available and component is loaded */}
          {!apiUnavailable && isLoaded && (
            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => window.location.href = "/signup"}
              >
                Sign Up
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => window.location.href = "/login"}
              >
                Log In
              </Button>
            </div>
          )}
          
          {/* Show loading state while checking API */}
          {isCheckingApi && (
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="text-base">Checking connection...</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
