"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Sparkles, Star } from "lucide-react"

interface ZodiacSign {
  sign: string
  symbol: string
  element: string
  traits: string[]
  dateRange: string
}

const zodiacSigns: ZodiacSign[] = [
  {
    sign: "Aries",
    symbol: "♈",
    element: "Fire",
    traits: ["Bold", "Energetic", "Leadership"],
    dateRange: "Mar 21 - Apr 19",
  },
  {
    sign: "Taurus",
    symbol: "♉",
    element: "Earth",
    traits: ["Stable", "Practical", "Determined"],
    dateRange: "Apr 20 - May 20",
  },
  {
    sign: "Gemini",
    symbol: "♊",
    element: "Air",
    traits: ["Adaptable", "Curious", "Quick-thinking"],
    dateRange: "May 21 - Jun 20",
  },
  {
    sign: "Cancer",
    symbol: "♋",
    element: "Water",
    traits: ["Intuitive", "Protective", "Emotional"],
    dateRange: "Jun 21 - Jul 22",
  },
  {
    sign: "Leo",
    symbol: "♌",
    element: "Fire",
    traits: ["Confident", "Creative", "Generous"],
    dateRange: "Jul 23 - Aug 22",
  },
  {
    sign: "Virgo",
    symbol: "♍",
    element: "Earth",
    traits: ["Analytical", "Perfectionist", "Helpful"],
    dateRange: "Aug 23 - Sep 22",
  },
  {
    sign: "Libra",
    symbol: "♎",
    element: "Air",
    traits: ["Balanced", "Diplomatic", "Aesthetic"],
    dateRange: "Sep 23 - Oct 22",
  },
  {
    sign: "Scorpio",
    symbol: "♏",
    element: "Water",
    traits: ["Intense", "Mysterious", "Transformative"],
    dateRange: "Oct 23 - Nov 21",
  },
  {
    sign: "Sagittarius",
    symbol: "♐",
    element: "Fire",
    traits: ["Adventurous", "Optimistic", "Philosophical"],
    dateRange: "Nov 22 - Dec 21",
  },
  {
    sign: "Capricorn",
    symbol: "♑",
    element: "Earth",
    traits: ["Ambitious", "Disciplined", "Practical"],
    dateRange: "Dec 22 - Jan 19",
  },
  {
    sign: "Aquarius",
    symbol: "♒",
    element: "Air",
    traits: ["Independent", "Innovative", "Humanitarian"],
    dateRange: "Jan 20 - Feb 18",
  },
  {
    sign: "Pisces",
    symbol: "♓",
    element: "Water",
    traits: ["Compassionate", "Artistic", "Intuitive"],
    dateRange: "Feb 19 - Mar 20",
  },
]

function getZodiacSign(birthDate: string): ZodiacSign | null {
  const date = new Date(birthDate)
  const month = date.getMonth() + 1
  const day = date.getDate()

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return zodiacSigns[0] // Aries
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return zodiacSigns[1] // Taurus
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return zodiacSigns[2] // Gemini
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return zodiacSigns[3] // Cancer
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return zodiacSigns[4] // Leo
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return zodiacSigns[5] // Virgo
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return zodiacSigns[6] // Libra
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return zodiacSigns[7] // Scorpio
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return zodiacSigns[8] // Sagittarius
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return zodiacSigns[9] // Capricorn
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return zodiacSigns[10] // Aquarius
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return zodiacSigns[11] // Pisces

  return null
}

interface ZodiacDetectorProps {
  birthDate: string
  onZodiacDetected: (zodiac: ZodiacSign | null) => void
}

export function ZodiacDetector({ birthDate, onZodiacDetected }: ZodiacDetectorProps) {
  const [zodiac, setZodiac] = useState<ZodiacSign | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (birthDate) {
      setIsAnimating(true)
      const detectedZodiac = getZodiacSign(birthDate)

      setTimeout(() => {
        setZodiac(detectedZodiac)
        onZodiacDetected(detectedZodiac)
        setIsAnimating(false)
      }, 800)
    }
  }, [birthDate, onZodiacDetected])

  if (!birthDate) return null

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 border-primary/30 dark:border-primary/40 backdrop-blur-sm">
      <div className="text-center space-y-4">
        {isAnimating ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center animate-pulse shadow-lg dark:shadow-primary/30">
              <Sparkles className="w-6 h-6 text-primary-foreground animate-spin" />
            </div>
            <p className="text-sm text-muted-foreground">Consulting the stars...</p>
          </div>
        ) : zodiac ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg dark:shadow-primary/30 animate-bounce">
                <span className="text-2xl text-primary-foreground">{zodiac.symbol}</span>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-foreground">{zodiac.sign}</h3>
                <p className="text-sm text-muted-foreground">{zodiac.dateRange}</p>
                <p className="text-xs text-accent dark:text-accent font-medium">{zodiac.element} Element</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Your Cosmic Traits:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {zodiac.traits.map((trait, index) => (
                  <span
                    key={trait}
                    className="px-3 py-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary text-xs rounded-full border border-primary/20 dark:border-primary/30"
                    style={{ animationDelay: `${index * 200}ms` }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center gap-1 text-accent dark:text-accent">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-xs">Your trading destiny awaits</span>
              <Star className="w-3 h-3 fill-current" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Unable to determine your sign</p>
        )}
      </div>
    </Card>
  )
}
