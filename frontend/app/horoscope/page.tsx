"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Calendar, Loader2, User, AlertCircle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getDailyHoroscope, type DailyHoroscope } from "@/lib/api/stocks"

// Comprehensive horoscope data for all 12 zodiac signs (static UI data)
const staticHoroscopeData = {
  Aries: {
    symbol: "♈",
    element: "Fire",
    dailyInsight:
      "Mars energizes your trading instincts today, Aries. Bold moves in technology sectors align with your pioneering spirit. The cosmic winds favor decisive action over hesitation.",
    marketPrediction:
      "Fire energy burns bright in innovation stocks. Your natural leadership draws you toward companies breaking new ground. Look for opportunities in sectors that disrupt traditional markets.",
    cosmicAdvice: "Trust your instincts today - the universe rewards swift, confident decisions. Don't second-guess your research.",
    vibeScore: 92,
  },
  Taurus: {
    symbol: "♉",
    element: "Earth",
    dailyInsight:
      "Venus grounds your financial decisions in practical wisdom, Taurus. Your patient approach to wealth-building finds favor in stable, dividend-paying investments. The stars align for long-term growth.",
    marketPrediction:
      "Earth energy supports established companies with strong fundamentals. Your appreciation for tangible value guides you toward real assets and reliable returns.",
    cosmicAdvice: "Patience is your superpower - let your investments mature like fine wine. Quality always trumps quick gains.",
    vibeScore: 88,
  },
  Gemini: {
    symbol: "♊",
    element: "Air",
    dailyInsight:
      "Mercury stimulates your analytical mind with market insights, Gemini. Your ability to process information quickly helps you spot trends before others. Communication technology sectors call to you.",
    marketPrediction:
      "Air energy flows through information and communication. Your curiosity leads you to diverse portfolio opportunities. Stay nimble and follow the data.",
    cosmicAdvice: "Your versatility is an asset - diversify your portfolio and stay informed. Knowledge is your cosmic currency.",
    vibeScore: 85,
  },
  Cancer: {
    symbol: "♋",
    element: "Water",
    dailyInsight:
      "The Moon illuminates intuitive investment choices, Cancer. Your emotional intelligence helps you understand market sentiment. Companies with strong customer loyalty resonate with your nurturing nature.",
    marketPrediction:
      "Water energy flows toward businesses that care for people. Your protective instincts guide you to stable, family-oriented companies with ethical practices.",
    cosmicAdvice: "Trust your gut feelings about investments - your intuition rarely leads you astray. Protect your portfolio like you protect those you love.",
    vibeScore: 87,
  },
  Leo: {
    symbol: "♌",
    element: "Fire",
    dailyInsight:
      "The Sun illuminates golden opportunities in luxury and entertainment sectors, Leo. Your magnetic presence attracts prosperity through creative investments. Premium brands call to your regal nature.",
    marketPrediction:
      "Solar energy highlights premium brands and creative industries. Your royal taste guides you toward quality investments that stand the test of time.",
    cosmicAdvice: "Shine bright in your investment choices - quality over quantity brings royal returns. Invest in companies you'd be proud to own.",
    vibeScore: 96,
  },
  Virgo: {
    symbol: "♍",
    element: "Earth",
    dailyInsight:
      "Mercury sharpens your analytical edge, Virgo. Your meticulous research uncovers value others overlook. Healthcare and technology efficiency plays align with your perfectionist standards.",
    marketPrediction:
      "Earth energy supports detailed analysis and practical solutions. Your eye for efficiency leads you to well-managed companies with optimized operations.",
    cosmicAdvice: "Your attention to detail is your greatest asset - analyze deeply before committing. Excellence in execution attracts cosmic rewards.",
    vibeScore: 90,
  },
  Libra: {
    symbol: "♎",
    element: "Air",
    dailyInsight:
      "Venus brings balance to your portfolio decisions, Libra. Your sense of fairness attracts you to ethical companies with strong values. Partnership opportunities in the market await your diplomatic touch.",
    marketPrediction:
      "Air energy flows toward harmony and collaboration. Your appreciation for beauty and balance guides you to well-rounded, socially responsible investments.",
    cosmicAdvice: "Seek balance in all things - diversification creates harmony in your portfolio. Fair dealing brings cosmic favor.",
    vibeScore: 86,
  },
  Scorpio: {
    symbol: "♏",
    element: "Water",
    dailyInsight:
      "Pluto's transformative power reveals hidden gems in emerging markets, Scorpio. Your intuitive depth uncovers what others miss in the financial depths. Trust your research into complex opportunities.",
    marketPrediction:
      "Water energy flows toward transformative technologies and mysterious opportunities. Your investigative nature thrives in uncovering undervalued assets.",
    cosmicAdvice: "Dive deep into research today - your intuition reveals profitable secrets. Transformation and rebirth bring wealth.",
    vibeScore: 89,
  },
  Sagittarius: {
    symbol: "♐",
    element: "Fire",
    dailyInsight:
      "Jupiter expands your investment horizons, Sagittarius. Your optimistic vision sees potential in international markets and growth sectors. Adventure in emerging technologies aligns with your explorer spirit.",
    marketPrediction:
      "Fire energy burns bright in expansion and growth. Your philosophical nature draws you to companies with bold visions and global reach.",
    cosmicAdvice: "Think big and aim high - the universe rewards your bold vision. International diversification brings fortune.",
    vibeScore: 93,
  },
  Capricorn: {
    symbol: "♑",
    element: "Earth",
    dailyInsight:
      "Saturn rewards your disciplined approach to wealth-building, Capricorn. Your long-term strategy and respect for tradition guide you to established market leaders. Patient accumulation brings cosmic favor.",
    marketPrediction:
      "Earth energy supports structured growth and traditional value. Your ambition aligns with blue-chip stocks and time-tested business models.",
    cosmicAdvice: "Slow and steady wins the race - your disciplined approach builds lasting wealth. Structure creates success.",
    vibeScore: 84,
  },
  Aquarius: {
    symbol: "♒",
    element: "Air",
    dailyInsight:
      "Uranus sparks innovative investment ideas, Aquarius. Your forward-thinking mind gravitates toward disruptive technologies and social change. Future-focused companies resonate with your revolutionary spirit.",
    marketPrediction:
      "Air energy electrifies innovation and progress. Your visionary nature leads you to companies changing the world for the better.",
    cosmicAdvice: "Embrace the future - your unique perspective spots opportunities others miss. Innovation is your cosmic gift.",
    vibeScore: 91,
  },
  Pisces: {
    symbol: "♓",
    element: "Water",
    dailyInsight:
      "Neptune enhances your intuitive trading wisdom, Pisces. Your empathetic nature connects you to companies that heal and inspire. Creative industries and spiritual wellness sectors call to your soul.",
    marketPrediction:
      "Water energy flows through creativity and compassion. Your imaginative spirit guides you to businesses that touch hearts and change lives.",
    cosmicAdvice: "Trust your dreams and visions - your spiritual connection to the market is real. Compassion guides profitable choices.",
    vibeScore: 87,
  },
}

// Investment style descriptions with personalized insights
const investmentStyleInsights = {
  casual: {
    label: "Casual Explorer",
    description: "You're on a journey of financial discovery",
    tradingInsight:
      "Your exploratory approach values learning over aggressive gains. Focus on understanding market fundamentals and building confidence through small, educational trades. The cosmos supports your patient growth.",
    strengths: "Patience, openness to learning, low-stress approach",
  },
  balanced: {
    label: "Balanced Seeker",
    description: "You blend wisdom with opportunity",
    tradingInsight:
      "Your balanced philosophy seeks harmony between growth and stability. Mix established blue-chips with selective growth opportunities. The universe rewards your measured approach to risk.",
    strengths: "Diversification, risk management, steady growth",
  },
  "profit-seeking": {
    label: "Profit Seeker",
    description: "You chase growth with focused intensity",
    tradingInsight:
      "Your aggressive pursuit of returns aligns with high-growth opportunities. Target emerging sectors and momentum plays, but maintain stop-losses. The stars favor bold moves backed by research.",
    strengths: "Quick decision-making, growth focus, market awareness",
  },
  playful: {
    label: "Playful Mystic",
    description: "You let cosmic wisdom guide your trades",
    tradingInsight:
      "Your spiritual connection to the market opens unique insights. Trust your intuition while honoring zodiac alignments. The universe speaks through synchronicities - follow the signs.",
    strengths: "Intuition, cosmic alignment, creative thinking",
  },
}

export default function HoroscopePage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isFetchingHoroscope, setIsFetchingHoroscope] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [horoscopeData, setHoroscopeData] = useState<DailyHoroscope | null>(null)

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Get user's zodiac sign and investment style
  const userSign = user?.profile?.zodiac_sign || "Leo"
  const userSymbol = user?.profile?.zodiac_symbol || "♌"
  const userElement = user?.profile?.zodiac_element || "Fire"
  const investingStyle = user?.profile?.investing_style || "balanced"

  const horoscope = staticHoroscopeData[userSign as keyof typeof staticHoroscopeData] || staticHoroscopeData.Leo
  const styleInfo = investmentStyleInsights[investingStyle as keyof typeof investmentStyleInsights] || investmentStyleInsights.balanced

  console.log('🌟 HoroscopePage state:', {
    hasUser: !!user,
    hasProfile: !!user?.profile,
    zodiacSign: user?.profile?.zodiac_sign,
    investingStyle: user?.profile?.investing_style,
    isLoading,
    isFetchingHoroscope,
    hasHoroscopeData: !!horoscopeData,
  })


  useEffect(() => {
    const fetchHoroscope = async () => {
      // If no user profile yet, just mark as not loading and return
      if (!user?.profile?.zodiac_sign) {
        console.log('🌟 No zodiac sign yet, waiting for user profile...')
        setIsLoading(false)
        return
      }

      console.log('🌟 Fetching horoscope for:', user.profile.zodiac_sign, user.profile.investing_style)
      setIsFetchingHoroscope(true)
      setError(null)

      try {
        const data = await getDailyHoroscope(true) // Force refresh to bypass cache
        console.log('🌟 Horoscope data received in component:', data)
        setHoroscopeData(data)
        setIsLoading(false)
      } catch (err) {
        console.error("🌟 Failed to fetch horoscope:", err)
        setError(err instanceof Error ? err.message : "Failed to load horoscope")
        setIsLoading(false)
      } finally {
        setIsFetchingHoroscope(false)
      }
    }

    // Initial fetch
    console.log('🌟 Effect running, user:', user?.username, 'zodiac:', user?.profile?.zodiac_sign)
    fetchHoroscope()

    // Set up refresh interval
    // Use 1 second when loading user data, 5 seconds when user is loaded
    const refreshInterval = !user?.profile?.zodiac_sign ? 1000 : 5000
    console.log('🌟 Setting up interval with', refreshInterval, 'ms')
    const intervalId = setInterval(fetchHoroscope, refreshInterval)

    // Cleanup interval on unmount
    return () => {
      console.log('🌟 Cleaning up interval')
      clearInterval(intervalId)
    }
  }, [user])

  const getVibeColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 80) return "text-yellow-500"
    return "text-orange-500"
  }


  if (!user?.profile?.zodiac_sign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-20 pb-8 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4 text-center">
          <Loader2 className="w-10 h-10 mx-auto mb-4 text-primary animate-spin" />
          <h2 className="text-xl font-bold mb-2">Hold on while we fetch you fresh data</h2>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-16 pb-4">
      {/* Cosmic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-8 w-1 h-1 bg-accent rounded-full animate-pulse" />
        <div className="absolute top-40 right-12 w-1.5 h-1.5 bg-secondary rounded-full animate-pulse delay-500" />
        <div className="absolute bottom-32 left-16 w-1 h-1 bg-primary rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-20 right-8 w-2 h-2 bg-accent rounded-full animate-pulse delay-700" />
        <div className="absolute top-60 left-1/2 w-1 h-1 bg-secondary rounded-full animate-pulse delay-300" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center pt-6 pb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Cosmic Forecast
          </h1>
          <p className="text-base text-muted-foreground mb-3">Personalized for you</p>
          <div className="flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">{currentDate}</p>
          </div>
        </div>

        {/* Single Column Layout */}
        <div className="max-w-3xl mx-auto space-y-4">
            {/* Profile Summary Card */}
            <Card className="p-5 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/30 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-2xl">
                    {userSymbol}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-foreground">{userSign}</h2>
                    <Badge variant="outline" className="text-sm">
                      {userElement} Element
                    </Badge>
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getVibeColor(horoscope.vibeScore)}`}>
                    {horoscope.vibeScore}%
                  </div>
                  <p className="text-sm text-muted-foreground">Vibe</p>
                </div>
              </div>

              {/* Investment Style */}
              <div className="pt-3 border-t border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-secondary" />
                  <span className="text-sm font-semibold text-foreground">{styleInfo.label}</span>
                </div>
                <p className="text-sm text-muted-foreground italic">{styleInfo.description}</p>
              </div>
            </Card>

          {/* Your Daily Forecast */}
          <Card className="p-5 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/30 backdrop-blur-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-2 justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Your Daily Forecast</h3>
                </div>
                {isFetchingHoroscope && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Updating...</span>
                  </div>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground ml-2">Generating your cosmic forecast...</p>
                </div>
              ) : error ? (
                <div className="flex items-center gap-3 py-6 text-muted-foreground">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">Sorry but this feature isn't available</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              ) : horoscopeData ? (
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p className="text-base leading-loose text-foreground">
                    {horoscopeData.horoscope_text}
                  </p>
                  <p>
                    {horoscope.dailyInsight} {horoscope.marketPrediction}
                  </p>
                  <div className="pt-3 border-t border-border/30">
                    <p>
                      As a <span className="font-medium text-foreground">{styleInfo.label}</span>, your cosmic blueprint suggests {styleInfo.tradingInsight.toLowerCase()}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
