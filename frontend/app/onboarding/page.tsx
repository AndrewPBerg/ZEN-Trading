"use client"

import type React from "react"

import { Suspense, useState, useEffect } from "react"
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

function OnboardingPageContent() {
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
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 dark:from-primary/5 dark:via-background dark:to-secondary/5 p-6 pb-20 relative overflow-hidden">
      {/* Enhanced Cosmic Background */}
      <div className="absolute inset-0 bg-stars opacity-20 dark:opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-aurora" />
      
      {/* Enhanced Cosmic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-32 left-8 w-2 h-2 bg-accent rounded-full animate-twinkle shadow-cosmic" />
        <div className="absolute top-20 right-12 w-2.5 h-2.5 bg-secondary rounded-full animate-float-gentle shadow-cosmic" />
        <div className="absolute bottom-40 left-16 w-2 h-2 bg-primary rounded-full animate-shimmer shadow-cosmic" />
        <div className="absolute bottom-60 right-8 w-3 h-3 bg-accent rounded-full animate-pulse-slow shadow-cosmic" />
        <div className="absolute top-1/2 left-1/4 w-1.5 h-1.5 bg-secondary rounded-full animate-twinkle delay-300" />
        <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-primary rounded-full animate-float-gentle delay-700" />
      </div>

      <div className="max-w-md mx-auto pt-8 relative z-10 animate-fade-in-up">
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto bg-cosmic-gradient rounded-full flex items-center justify-center mb-6 shadow-cosmic-lg animate-cosmic-pulse">
            <Star className="w-8 h-8 text-primary-foreground drop-shadow-lg" fill="currentColor" />
          </div>
          <h1 className="text-3xl font-bold cosmic-text mb-3 animate-gradient-shift">Welcome to Your Cosmic Journey</h1>
          <p className="text-muted-foreground text-lg">Let's align your trading with the stars</p>
          {isDemo && (
            <div className="mt-4">
              <span className="text-sm bg-accent/20 text-accent px-4 py-2 rounded-full border border-accent/30 font-medium animate-pulse-slow">
                Demo Mode
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Enhanced Personal Information */}
          <Card className="p-8 bg-card/90 dark:bg-card/95 backdrop-blur-md border-primary/30 dark:border-primary/40 glass card-hover animate-fade-in-up">
            <div className="space-y-6">
              {/* Date of Birth */}
              <div className="space-y-3">
                <Label htmlFor="birthDate" className="text-base font-semibold text-foreground">
                  Date of Birth
                  <span className="block text-sm text-muted-foreground mt-1">Must be at least 18 years old</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split("T")[0]}
                  max={(() => {
                    const today = new Date();
                    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                    return maxDate.toISOString().split("T")[0];
                  })()}
                  
                  onChange={e => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                  className="bg-background dark:bg-input border-border dark:border-border/70 focus:border-primary dark:focus:border-primary text-foreground dark:text-foreground [&::-webkit-calendar-picker-indicator]:dark:invert [&::-webkit-calendar-picker-indicator]:dark:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer hover:border-primary/70 dark:hover:border-primary/80 focus-cosmic rounded-xl py-3 text-base"
                />
              </div>
            </div>
          </Card>

          {/* Zodiac Detection */}
          {formData.birthDate && <ZodiacDetector birthDate={formData.birthDate} onZodiacDetected={setDetectedZodiac} />}

          {/* Enhanced Investing Vibe Selection */}
          <Card className="p-8 bg-card/90 dark:bg-card/95 backdrop-blur-md border-primary/30 dark:border-primary/40 glass card-hover animate-fade-in-up">
            <div className="space-y-6 flex flex-col items-center">
              <Label className="text-lg font-semibold text-foreground text-center">What's your investing vibe?</Label>
              <div className="w-full flex justify-center">
                <Select
                  value={formData.investingVibe}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, investingVibe: value }))}
                >
                  <SelectTrigger className="bg-background dark:bg-input border-border dark:border-border/70 focus:border-primary dark:focus:border-primary text-foreground hover:border-primary/70 dark:hover:border-primary/80 w-full max-w-sm mx-auto text-center focus-cosmic rounded-xl py-3 text-base" 
                    style={{ textAlign: 'center' }}>
                    <SelectValue placeholder="Choose your cosmic trading style" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover dark:bg-popover border-border dark:border-border/70 glass backdrop-blur-xl">
                    {investingVibes.map((vibe) => (
                      <SelectItem 
                        key={vibe.value} 
                        value={vibe.value}
                        className="focus:bg-primary/10 dark:focus:bg-primary/20 focus:text-foreground rounded-lg"
                      >
                        <div className="w-full flex flex-col items-center justify-center text-center py-2">
                          <span className="w-full font-semibold text-foreground">{vibe.label}</span>
                          <span className="w-full text-sm text-muted-foreground mt-1">{vibe.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Enhanced Starting Balance Selection */}
          <Card className="p-8 bg-card/90 dark:bg-card/95 backdrop-blur-md border-primary/30 dark:border-primary/40 glass card-hover animate-fade-in-up">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold text-foreground">Starting Account Balance</Label>
                <div className="flex items-center gap-2 bg-cosmic-gradient px-4 py-2 rounded-xl border border-primary/30 shadow-cosmic">
                  <DollarSign className="w-5 h-5 text-primary-foreground animate-pulse-slow" />
                  <span className="text-xl font-bold text-primary-foreground">
                    ${formData.startingBalance.toLocaleString()}
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
              <div className="flex justify-between text-sm text-muted-foreground font-medium">
                <span>$10,000</span>
                <span>$1,000,000</span>
              </div>
            </div>
          </Card>

          {/* Enhanced Continue Button */}
          <Button
            type="submit"
            variant="cosmic"
            size="lg"
            disabled={!isFormValid || isSubmitting}
            className="w-full animate-fade-in-up"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 animate-spin" />
                Aligning your cosmic profile...
              </div>
            ) : (
              <div className="flex items-center gap-3">
                Enter the Trading Universe
                <ArrowRight className="w-5 h-5 animate-pulse-slow" />
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

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-purple-950/10 to-background">
        <div className="text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <OnboardingPageContent />
    </Suspense>
  )
}
