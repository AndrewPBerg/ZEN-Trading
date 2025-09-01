"use client"

import { useEffect, useState } from "react"

interface Star {
  id: number
  x: number
  y: number
  size: number
  animationDelay: number
  animationDuration: number
}

export function AnimatedStars() {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const newStars: Star[] = []
      const starCount = 50

      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          animationDelay: Math.random() * 5,
          animationDuration: Math.random() * 3 + 2,
        })
      }
      setStars(newStars)
    }

    generateStars()
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Light mode stars - golden shimmer */}
      <div className="absolute inset-0 dark:hidden">
        {stars.map((star) => (
          <div
            key={`light-${star.id}`}
            className="absolute animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`,
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded-full opacity-60 animate-shimmer" />
          </div>
        ))}
      </div>

      {/* Dark mode stars - purple gradient */}
      <div className="absolute inset-0 hidden dark:block">
        {stars.map((star) => (
          <div
            key={`dark-${star.id}`}
            className="absolute animate-twinkle"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`,
            }}
          >
            <div className="w-full h-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 rounded-full opacity-70 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
