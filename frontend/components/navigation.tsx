"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { TrendingUp, Star, Eye, Sparkles, Moon, Sun, User, Settings, LogOut, AlertTriangle } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { isDemoMode } from "@/lib/demo-mode"
import { getMarketStatus, type MarketStatusResponse } from "@/lib/api/market"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/discovery", icon: TrendingUp, label: "Discovery" },
  { href: "/watchlist", icon: Eye, label: "Watchlist" },
  { href: "/portfolio", icon: Star, label: "Portfolio" },
  { href: "/horoscope", icon: Sparkles, label: "Horoscope" },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, isLoading: authLoading } = useAuth()
  // Initialize theme state synchronously to match the blocking script in layout.tsx
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false
    // Use the same logic as the blocking script
    const savedTheme = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return savedTheme === 'dark' || (!savedTheme && prefersDark)
  })
  const [mounted, setMounted] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [marketStatus, setMarketStatus] = useState<MarketStatusResponse | null>(null)
  // Initialize hasAuth synchronously from localStorage to avoid delay
  const [hasAuth, setHasAuth] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('zenTraderTokens') !== null || localStorage.getItem('zenTraderDemoMode') === 'true'
  })

  // Hide navigation on specific pages
  const hideNavPages = ["/", "/login", "/signup", "/onboarding"]
  const shouldHideNav = hideNavPages.includes(pathname)

  useEffect(() => {
    setMounted(true)
    setIsDemo(isDemoMode())
    
    // Sync theme state with DOM to ensure consistency
    const syncThemeWithDOM = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark')
      setIsDark(hasDarkClass)
    }
    syncThemeWithDOM()
    
    // Check if user has auth tokens immediately
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const hasTokens = localStorage.getItem('zenTraderTokens') !== null || localStorage.getItem('zenTraderDemoMode') === 'true'
        setHasAuth(hasTokens)
      }
    }
    
    checkAuth()
    
    // Listen for storage changes (login/logout events)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zenTraderTokens' || e.key === 'zenTraderDemoMode') {
        checkAuth()
      }
      // Sync theme when it changes in localStorage
      if (e.key === 'theme') {
        syncThemeWithDOM()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Fetch initial market status
    fetchMarketStatus()
    
    // Refresh market status every 60 seconds
    const interval = setInterval(fetchMarketStatus, 60000)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Update hasAuth when user state changes
  useEffect(() => {
    if (user) {
      setHasAuth(true)
    } else if (!authLoading) {
      // Only set to false if auth loading is complete and there's no user
      setHasAuth(false)
    }
  }, [user, authLoading])

  const fetchMarketStatus = async () => {
    try {
      const status = await getMarketStatus()
      setMarketStatus(status)
    } catch (error) {
      console.error('Failed to fetch market status:', error)
      // Silently fail - don't show market status if backend is unavailable
      // This prevents the navigation from breaking if backend is down
      setMarketStatus(null)
    }
  }

  // Don't render navigation on excluded pages
  if (shouldHideNav) {
    return null
  }

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)

    if (newIsDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  const handleLogout = () => {
    logout()
    setHasAuth(false) // Immediately update state
    router.push("/")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg">
      <div className="relative flex items-center justify-between px-6 py-4">
        {/* Navigation Items */}
        <div className="flex items-center gap-2 z-10">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "text-primary bg-primary/10 shadow-md"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                <Icon 
                  size={20} 
                  className={`transition-all duration-300 ${
                    isActive ? "scale-110 drop-shadow-sm" : "group-hover:scale-110"
                  }`} 
                />
                <span className={`overflow-hidden transition-all duration-300 text-sm font-medium whitespace-nowrap ${
                  isActive 
                    ? "max-w-24 ml-0 opacity-100" 
                    : "max-w-0 ml-0 opacity-0 group-hover:max-w-24 group-hover:ml-0 group-hover:opacity-100"
                }`}>
                  {label}
                </span>
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-transparent animate-pulse-glow" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Center: Demo Mode Warning Bubble - Absolutely Centered */}
        {mounted && isDemo && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg pointer-events-none animate-pulse">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium whitespace-nowrap">
              Demo Mode Active
            </span>
          </div>
        )}

        {/* Right Side: Market Status, Theme Toggle & User Menu */}
        <div className="flex items-center gap-3 z-10">
          {/* Market Status Indicator */}
          {mounted && marketStatus && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${marketStatus.is_open ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-foreground">
                  {marketStatus.is_open ? 'Market Open' : 'Market Closed'}
                </span>
              </div>
              <div className="border-l border-border/50 pl-3">
                <div className="text-sm">
                  <span className="text-muted-foreground font-medium">
                    {marketStatus.is_open ? 'Closes' : 'Opens'}:
                  </span>
                  <span className="text-foreground ml-1">
                    {(() => {
                      const nextEventDate = new Date(marketStatus.next_event_time)
                      const today = new Date()
                      const isToday = nextEventDate.toDateString() === today.toDateString()
                      const tomorrow = new Date(today)
                      tomorrow.setDate(tomorrow.getDate() + 1)
                      const isTomorrow = nextEventDate.toDateString() === tomorrow.toDateString()
                      
                      if (isToday) {
                        return nextEventDate.toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          timeZoneName: 'short'
                        })
                      } else if (isTomorrow) {
                        return 'Tomorrow ' + nextEventDate.toLocaleString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          timeZoneName: 'short'
                        })
                      } else {
                        return nextEventDate.toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          timeZoneName: 'short'
                        })
                      }
                    })()}
                  </span>
                </div>
              </div>
            </div>
          )}
          
          {/* Theme Toggle */}
          {mounted && (
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-primary hover:bg-primary/5 p-2 transition-all duration-300 hover:scale-110 rounded-xl"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* User Menu - Always visible, shows login options when not authenticated */}
          {mounted && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/5 p-2 transition-all duration-300 hover:scale-110 rounded-xl"
                >
                  <User size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border/50 shadow-xl">
                {isDemo ? (
                  <>
                    {hasAuth && (
                      <>
                        <DropdownMenuItem 
                          onClick={() => router.push("/settings")}
                          className="cursor-pointer text-foreground focus:bg-primary/10 focus:text-primary rounded-lg mx-1 my-0.5"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/50 my-1" />
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="text-orange-600 focus:text-orange-700 cursor-pointer focus:bg-orange-100 rounded-lg mx-1 my-0.5"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Exit Demo
                    </DropdownMenuItem>
                  </>
                ) : hasAuth ? (
                  <>
                    <DropdownMenuItem 
                      onClick={() => router.push("/settings")}
                      className="cursor-pointer text-foreground focus:bg-primary/10 focus:text-primary rounded-lg mx-1 my-0.5"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/50 my-1" />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="text-destructive focus:text-destructive cursor-pointer focus:bg-destructive/10 rounded-lg mx-1 my-0.5"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem 
                      onClick={() => router.push("/login")}
                      className="cursor-pointer text-foreground focus:bg-primary/10 focus:text-primary rounded-lg mx-1 my-0.5"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Login
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => router.push("/signup")}
                      className="cursor-pointer text-foreground focus:bg-primary/10 focus:text-primary rounded-lg mx-1 my-0.5"
                    >
                      <User className="w-4 h-4 mr-3" />
                      Sign Up
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}
