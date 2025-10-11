"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { TrendingUp, Star, Eye, Sparkles, Moon, Sun, User, Settings, LogOut } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"
import { isDemoMode } from "@/lib/demo-mode"
import { getMarketStatus, type MarketStatusResponse } from "@/lib/api/market"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { href: "/discovery", icon: TrendingUp, label: "Discovery" },
  { href: "/watchlist", icon: Eye, label: "Watchlist" },
  { href: "/portfolio", icon: Star, label: "Portfolio" },
  { href: "/horoscope", icon: Sparkles, label: "Horoscope" },
]

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isDemo, setIsDemo] = useState(false)
  const [marketStatus, setMarketStatus] = useState<MarketStatusResponse | null>(null)

  // Hide navigation on specific pages
  const hideNavPages = ["/", "/login", "/signup", "/onboarding"]
  const shouldHideNav = hideNavPages.includes(pathname)

  useEffect(() => {
    setMounted(true)
    const hasDarkClass = document.documentElement.classList.contains("dark")
    setIsDark(hasDarkClass)
    setIsDemo(isDemoMode())
    
    // Fetch initial market status
    fetchMarketStatus()
    
    // Refresh market status every 60 seconds
    const interval = setInterval(fetchMarketStatus, 60000)
    return () => clearInterval(interval)
  }, [])

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
    router.push("/")
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-lg border-b border-purple-500/20">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Navigation Items */}
        <div className="flex items-center gap-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`group relative flex items-center gap-0 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "text-gold-400 bg-purple-300/50"
                    : "text-purple-300 hover:text-gold-300 hover:bg-purple-800/30"

                }`}
              >
                <Icon 
                  size={20} 
                  className={`transition-all duration-300 ${
                    isActive ? "drop-shadow-lg scale-110" : "group-hover:scale-125"
                  }`} 
                />
                <span className={`overflow-hidden transition-all duration-300 text-sm font-medium whitespace-nowrap ${
                  isActive 
                    ? "max-w-20 ml-2 opacity-100 text-gold-400" 
                    : "max-w-0 ml-0 opacity-0 group-hover:max-w-20 group-hover:ml-2 group-hover:opacity-100"
                }`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Right Side: Market Status, Theme Toggle & User Menu */}
        <div className="flex items-center gap-2">
          {/* Market Status Indicator */}
          {mounted && marketStatus && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-800/30 border border-purple-500/20">
                    <div className={`w-2 h-2 rounded-full ${marketStatus.is_open ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-xs text-purple-300 font-medium">
                      {marketStatus.is_open ? 'Market Open' : 'Market Closed'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-purple-950/95 border-purple-500/30">
                  <div className="text-sm">
                    <p className="font-medium">
                      {marketStatus.is_open ? 'Closes' : 'Opens'} at:
                    </p>
                    <p className="text-purple-300">
                      {new Date(marketStatus.next_event_time).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        timeZoneName: 'short'
                      })}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Theme Toggle */}
          {mounted && (
            <Button
              onClick={toggleTheme}
              variant="ghost"
              size="sm"
              className="text-purple-300 hover:text-gold-300 hover:bg-purple-800/30 p-2 transition-all duration-300 hover:scale-110"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          )}

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-300 hover:text-gold-300 hover:bg-purple-800/30 p-2 transition-all duration-300 hover:scale-110"
                >
                  <User size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-purple-950/95 border-purple-500/30">
                <div className="px-3 py-2">
                  <p className="font-medium text-foreground">
                    {user.first_name} {user.last_name}
                  </p>
                  {user.profile?.zodiac_sign && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <span>{user.profile.zodiac_symbol}</span>
                      <span>{user.profile.zodiac_sign}</span>
                    </p>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-purple-500/20" />
                <DropdownMenuItem 
                  onClick={() => router.push("/settings")}
                  className="cursor-pointer focus:bg-purple-800/30 focus:text-gold-300"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-purple-500/20" />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-red-400 focus:text-red-300 cursor-pointer focus:bg-purple-800/30"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {isDemo ? "Exit Demo" : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </nav>
  )
}
