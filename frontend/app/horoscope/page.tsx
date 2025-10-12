"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Moon, Sun, TrendingUp, Sparkles, Calendar, Loader2, User, Plus } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { getZodiacMatchedStocks, addToWatchlist, type MatchedStock } from "@/lib/api/stocks"
import { useToast } from "@/hooks/use-toast"

// Comprehensive horoscope data for all 12 zodiac signs
const horoscopeData = {
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
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alignedStocks, setAlignedStocks] = useState<MatchedStock[]>([])
  const [addingToWatchlist, setAddingToWatchlist] = useState<string | null>(null)

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" })

  // Get user's zodiac sign and investment style
  const userSign = user?.profile?.zodiac_sign || "Leo"
  const userSymbol = user?.profile?.zodiac_symbol || "♌"
  const userElement = user?.profile?.zodiac_element || "Fire"
  const investingStyle = user?.profile?.investing_style || "balanced"

  const horoscope = horoscopeData[userSign as keyof typeof horoscopeData] || horoscopeData.Leo
  const styleInfo = investmentStyleInsights[investingStyle as keyof typeof investmentStyleInsights] || investmentStyleInsights.balanced

  useEffect(() => {
    const fetchAlignedStocks = async () => {
      if (!user?.profile?.zodiac_sign) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        const response = await getZodiacMatchedStocks(true) // Force refresh
        // Get top 3 stocks by compatibility score
        const topStocks = response.matched_stocks
          .sort((a, b) => b.compatibility_score - a.compatibility_score)
          .slice(0, 3)
        setAlignedStocks(topStocks)
      } catch (err) {
        console.error("Failed to fetch aligned stocks:", err)
        setError(err instanceof Error ? err.message : "Failed to load aligned stocks")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAlignedStocks()
  }, [user])

  const getVibeColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 80) return "text-yellow-500"
    return "text-orange-500"
  }

  const getAlignmentColor = (score: number) => {
    if (score === 4) return "text-green-500"
    if (score === 3) return "text-blue-500"
    if (score === 2) return "text-yellow-500"
    return "text-orange-500"
  }

  const getAlignmentPercentage = (score: number) => {
    // Convert score (1-4) to percentage (70-100)
    return 70 + (score - 1) * 10
  }

  const handleAddToWatchlist = async (ticker: string) => {
    setAddingToWatchlist(ticker)
    try {
      await addToWatchlist(ticker)
      // Remove the stock from the aligned stocks list
      setAlignedStocks((prevStocks) => prevStocks.filter((stock) => stock.ticker !== ticker))
      toast({
        title: "Added to Watchlist",
        description: `${ticker} has been added to your watchlist.`,
      })
    } catch (err) {
      console.error("Failed to add to watchlist:", err)
      toast({
        title: "Failed to Add",
        description: err instanceof Error ? err.message : "Could not add to watchlist",
        variant: "destructive",
      })
    } finally {
      setAddingToWatchlist(null)
    }
  }

  // Generate dynamic horoscope text
  const generateHoroscopeText = () => {
    const energyWords = ["powerful", "transformative", "dynamic", "favorable", "intense", "harmonious"]
    const marketWords = ["opportunities", "movements", "shifts", "developments", "trends", "signals"]
    const alignmentWords = ["aligns perfectly", "resonates strongly", "harmonizes", "channels energy", "guides you"]
    
    const energy = energyWords[Math.floor(Math.random() * energyWords.length)]
    const market = marketWords[Math.floor(Math.random() * marketWords.length)]
    const alignment = alignmentWords[Math.floor(Math.random() * alignmentWords.length)]

    return `Today is ${dayOfWeek}, and you will experience ${energy} ${market} in the markets. Your ${userSign} alignment ${alignment} toward strategic opportunities that match your cosmic energy. ${horoscope.cosmicAdvice}`
  }

  if (!user?.profile?.zodiac_sign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 pt-20 pb-8 flex items-center justify-center">
        <Card className="p-8 max-w-md mx-4 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-bold mb-2">Complete Your Cosmic Profile</h2>
          <p className="text-muted-foreground">
            Please complete onboarding to unlock your personalized daily horoscope and cosmic trading guidance.
          </p>
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

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
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

            {/* Your Daily Forecast - Combined Comprehensive Forecast */}
            <Card className="p-5 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 border-primary/30 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">Your Daily Forecast</h3>
                </div>
                <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
                  <p className="text-base leading-loose">
                    {generateHoroscopeText()}
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
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Aligned Stocks */}
            <Card className="p-5 bg-card/80 backdrop-blur-sm border-secondary/20">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-secondary" fill="currentColor" />
                  <h3 className="text-base font-semibold text-foreground">Today's Aligned Stocks</h3>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : error ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">{error}</p>
                  </div>
                ) : alignedStocks.length > 0 ? (
                  <div className="space-y-3">
                    {alignedStocks.map((stock, index) => (
                      <div
                        key={stock.ticker}
                        className="flex items-start gap-3 p-3 bg-background/50 rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-base font-medium text-foreground">{stock.ticker}</h4>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-accent" fill="currentColor" />
                                <span className={`text-sm font-medium ${getAlignmentColor(stock.compatibility_score)}`}>
                                  {getAlignmentPercentage(stock.compatibility_score)}%
                                </span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2"
                                onClick={() => handleAddToWatchlist(stock.ticker)}
                                disabled={addingToWatchlist === stock.ticker}
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{stock.company_name}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="secondary" className="text-sm">
                              {stock.zodiac_sign}
                            </Badge>
                            <span className="text-muted-foreground capitalize text-sm">{stock.match_type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No aligned stocks available</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
