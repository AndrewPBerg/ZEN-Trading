"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { TrendingUp, Star, CopySlash as Crystal, User, Moon } from "lucide-react"

const navItems = [
  { href: "/discovery", icon: TrendingUp, label: "Discovery" },
  { href: "/portfolio", icon: Star, label: "Portfolio" },
  { href: "/watchlist", icon: Crystal, label: "Watchlist" },
  { href: "/horoscope", icon: User, label: "Horoscope" },
  { href: "/tarot", icon: Moon, label: "Tarot" },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900/95 via-indigo-900/95 to-purple-900/95 backdrop-blur-lg border-t border-purple-500/20">
      <div className="flex items-center justify-center px-2 py-3">
        <div className="flex items-center gap-2">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "text-gold-400 bg-purple-800/50 scale-110"
                    : "text-purple-300 hover:text-gold-300 hover:bg-purple-800/30"
                }`}
              >
                <Icon size={20} className={isActive ? "drop-shadow-lg" : ""} />
                <span className="text-xs font-medium">{label}</span>
                {isActive && <div className="w-1 h-1 bg-gold-400 rounded-full animate-pulse" />}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
