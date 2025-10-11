"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ZodiacDetector } from "@/components/zodiac-detector"
import { ArrowRight, Sparkles, Star, DollarSign } from "lucide-react"
import { submitOnboarding } from "@/lib/api/onboarding"
import type { OnboardingData } from "@/lib/api/onboarding"
import { createDemoUser, isDemoMode, setDemoMode } from "@/lib/demo-mode"

const investingVibes = [
  { value: "casual", label: "Casual Explorer", description: "I'm just getting started" },
  { value: "balanced", label: "Balanced Seeker", description: "Steady growth with some adventure" },
  { value: "profit-seeking", label: "Profit Seeker", description: "Show me the money" },
  { value: "playful", label: "Playful Mystic", description: "Let the stars guide my trades" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isDemo, setIsDemo] = useState(false)
  const [formData, setFormData] = useState({
    birthDate: "",
    investingVibe: "",
    startingBalance: 100000,
  })
  const [detectedZodiac, setDetectedZodiac] = useState<{
    sign: string
    symbol: string
    element: string
    traits: string[]
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Check if we're in demo mode from URL params or localStorage
    const demoParam = searchParams.get('mode') === 'demo'
    const demoModeActive = isDemoMode()
    
    if (demoParam || demoModeActive) {
      setIsDemo(true)
      setDemoMode(true)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.birthDate || !formData.investingVibe || !detectedZodiac) return

    setIsSubmitting(true)
    
    try {
      if (isDemo) {
        // Demo mode: Create local demo user without API call
        const demoData = createDemoUser({
          date_of_birth: formData.birthDate,
          zodiac_sign: detectedZodiac.sign,
          zodiac_symbol: detectedZodiac.symbol,
          zodiac_element: detectedZodiac.element,
          investing_style: formData.investingVibe,
          starting_balance: formData.startingBalance,
        })
        
        console.log("Demo onboarding complete:", demoData)
        
        // Navigate to discovery page
        router.push("/discovery")
      } else {
        // Authenticated mode: Submit to backend
        const onboardingData: OnboardingData = {
          date_of_birth: formData.birthDate,
          zodiac_sign: detectedZodiac.sign,
          zodiac_symbol: detectedZodiac.symbol,
          zodiac_element: detectedZodiac.element,
          investing_style: formData.investingVibe,
          starting_balance: formData.startingBalance,
        }

        const result = await submitOnboarding(onboardingData)
        console.log("Onboarding complete:", result)
        
        // Navigate to discovery page
        router.push("/discovery")
      }
    } catch (error) {
      console.error("Onboarding error:", error)
      // You might want to show an error message to the user here
      alert(error instanceof Error ? error.message : "Failed to submit onboarding data")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = formData.birthDate && formData.investingVibe && detectedZodiac

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-primary/5 dark:via-background dark:to-secondary/5 p-6 pb-20">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-8 w-1 h-1 bg-accent rounded-full animate-pulse" />
        <div className="absolute top-20 right-12 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-40 left-16 w-1 h-1 bg-primary rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-60 right-8 w-2 h-2 bg-accent rounded-full animate-pulse delay-700" />
      </div>

      <div className="max-w-md mx-auto pt-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Star className="w-6 h-6 text-primary-foreground" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Your Cosmic Journey</h1>
          <p className="text-muted-foreground">Let's align your trading with the stars</p>
          {isDemo && (
            <div className="mt-3">
              <span className="text-xs bg-accent/20 text-accent px-3 py-1 rounded-full border border-accent/30">
                Demo Mode
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="p-6 bg-card/90 dark:bg-card/95 backdrop-blur-sm border-primary/20 dark:border-primary/30">
            <div className="space-y-4">
              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-sm font-medium text-foreground">
                  Date of Birth
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
                  max={new Date().toISOString().split("T")[0]}
                  onFocus={e => {
                    if (!e.target.value) {
                      // Set default value to earliest selectable date if empty
                      e.target.value = new Date(new Date().setFullYear(new Date().getFullYear() - 20)).toISOString().split("T")[0]
                    }
                  }}
                  onChange={e => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="bg-background dark:bg-input border-border dark:border-border/70 focus:border-primary dark:focus:border-primary text-foreground dark:text-foreground [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:dark:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer hover:border-primary/70 dark:hover:border-primary/80"
                />
              </div>
            </div>
          </Card>

          {/* Zodiac Detection */}
          {formData.birthDate && <ZodiacDetector birthDate={formData.birthDate} onZodiacDetected={setDetectedZodiac} />}

          {/* Investing Vibe Selection */}
          <Card className="p-6 bg-card/90 dark:bg-card/95 backdrop-blur-sm border-primary/20 dark:border-primary/30">
            <div className="space-y-4 flex flex-col items-center">
              <Label className="text-sm font-medium text-foreground text-center">What's your investing vibe?</Label>
              <div className="w-full flex justify-center">
                <Select
                  value={formData.investingVibe}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, investingVibe: value }))}
                >
                  <SelectTrigger className="bg-background dark:bg-input border-border dark:border-border/70 focus:border-primary dark:focus:border-primary text-foreground hover:border-primary/70 dark:hover:border-primary/80 w-full max-w-xs mx-auto text-center" 
                    style={{ textAlign: 'center' }}>
                    <SelectValue placeholder="Choose your cosmic trading style" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover dark:bg-popover border-border dark:border-border/70">
                    {investingVibes.map((vibe) => (
                      <SelectItem 
                        key={vibe.value} 
                        value={vibe.value}
                        className="focus:bg-primary/10 dark:focus:bg-primary/20 focus:text-foreground"
                      >
                        <div className="flex flex-col items-center text-center">
                          <span className="font-medium text-foreground">{vibe.label}</span>
                          <span className="text-xs text-muted-foreground">{vibe.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Starting Balance Selection */}
          <Card className="p-6 bg-card/90 dark:bg-card/95 backdrop-blur-sm border-primary/20 dark:border-primary/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">Starting Account Balance</Label>
                <div className="flex items-center gap-1.5 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 px-3 py-1.5 rounded-lg border border-primary/20 dark:border-primary/30">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-lg font-bold text-foreground">
                    {formData.startingBalance.toLocaleString()}
                  </span>
                </div>
              </div>
              <Slider
                value={[formData.startingBalance]}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, startingBalance: value[0] }))}
                min={10000}
                max={1000000}
                step={10000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$10,000</span>
                <span>$1,000,000</span>
              </div>
            </div>
          </Card>

          {/* Continue Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground dark:text-primary-foreground font-semibold py-6 rounded-xl shadow-lg dark:shadow-primary/20 transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Aligning your cosmic profile...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                Enter the Trading Universe
                <ArrowRight className="w-4 h-4" />
              </div>
            )}
          </Button>
        </form>

        {/* Progress Indicator */}
        {/* <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <div className="w-2 h-2 bg-primary/30 rounded-full" />
            <div className="w-2 h-2 bg-primary/30 rounded-full" />
          </div>
        </div> */}
      </div>
    </div>
  )
}
