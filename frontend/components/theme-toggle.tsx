"use client"

import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Sync state with the already-applied theme from the blocking script
    const hasDarkClass = document.documentElement.classList.contains("dark")
    setIsDark(hasDarkClass)
  }, [])

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

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="fixed top-4 right-4 z-50 p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border/50">
        <div className="h-5 w-5" />
      </div>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 p-3 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 hover:bg-card transition-all duration-300 hover:scale-110"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-accent animate-pulse" />
      ) : (
        <Moon className="h-5 w-5 text-primary animate-pulse" />
      )}
    </button>
  )
}
