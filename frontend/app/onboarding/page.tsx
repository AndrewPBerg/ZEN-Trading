"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ZodiacDetector } from "@/components/zodiac-detector"
import { ArrowRight, Sparkles, Star } from "lucide-react"

const investingVibes = [
  { value: "casual", label: "Casual Explorer", description: "I'm just getting started" },
  { value: "balanced", label: "Balanced Seeker", description: "Steady growth with some adventure" },
  { value: "profit-seeking", label: "Profit Seeker", description: "Show me the money" },
  { value: "playful", label: "Playful Mystic", description: "Let the stars guide my trades" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    investingVibe: "",
  })
  const [detectedZodiac, setDetectedZodiac] = useState<{
    sign: string
    symbol: string
    element: string
    traits: string[]
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.birthDate || !formData.investingVibe) return

    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsSubmitting(false)

    console.log("Onboarding complete:", { ...formData, zodiac: detectedZodiac })
    router.push("/discovery")
  }

  const isFormValid = formData.name && formData.birthDate && formData.investingVibe && detectedZodiac

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 pb-20">
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
            <Star className="w-6 h-6 text-white" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to Your Cosmic Journey</h1>
          <p className="text-muted-foreground">Let's align your trading with the stars</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Your Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthDate" className="text-sm font-medium">
                  Date of Birth
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
                  className="bg-background/50 border-border/50 focus:border-primary"
                />
              </div>
            </div>
          </Card>

          {/* Zodiac Detection */}
          {formData.birthDate && <ZodiacDetector birthDate={formData.birthDate} onZodiacDetected={setDetectedZodiac} />}

          {/* Investing Vibe Selection */}
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-primary/20">
            <div className="space-y-4">
              <Label className="text-sm font-medium">What's your investing vibe?</Label>
              <Select
                value={formData.investingVibe}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, investingVibe: value }))}
              >
                <SelectTrigger className="bg-background/50 border-border/50 focus:border-primary">
                  <SelectValue placeholder="Choose your cosmic trading style" />
                </SelectTrigger>
                <SelectContent>
                  {investingVibes.map((vibe) => (
                    <SelectItem key={vibe.value} value={vibe.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{vibe.label}</span>
                        <span className="text-xs text-muted-foreground">{vibe.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Continue Button */}
          <Button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-6 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:scale-100"
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
        <div className="flex justify-center mt-8">
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary rounded-full" />
            <div className="w-2 h-2 bg-primary/30 rounded-full" />
            <div className="w-2 h-2 bg-primary/30 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
