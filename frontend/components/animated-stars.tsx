"use client"

import { useEffect, useState } from "react"

interface Star {
  id: number
  x: number
  y: number
  size: number
  animationDelay: number
  animationDuration: number
  type: 'star' | 'constellation' | 'planet'
  color: string
}

export function AnimatedStars() {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    // Generate random stars with different types
    const generateStars = () => {
      const newStars: Star[] = []
      const starCount = 60
      const constellationCount = 8
      const planetCount = 5

      // Regular stars
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1,
          animationDelay: Math.random() * 5,
          animationDuration: Math.random() * 3 + 2,
          type: 'star',
          color: Math.random() > 0.5 ? 'var(--primary)' : 'var(--secondary)'
        })
      }

      // Constellation points (larger, more prominent)
      for (let i = 0; i < constellationCount; i++) {
        newStars.push({
          id: i + starCount,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 3,
          animationDelay: Math.random() * 3,
          animationDuration: Math.random() * 4 + 3,
          type: 'constellation',
          color: 'var(--accent)'
        })
      }

      // Planets (largest, slowest moving)
      for (let i = 0; i < planetCount; i++) {
        newStars.push({
          id: i + starCount + constellationCount,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 6 + 4,
          animationDelay: Math.random() * 2,
          animationDuration: Math.random() * 6 + 4,
          type: 'planet',
          color: 'var(--primary)'
        })
      }
      setStars(newStars)
    }

    generateStars()
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Light mode stars */}
      <div className="absolute inset-0 dark:hidden">
        {stars.map((star) => (
          <div
            key={`light-${star.id}`}
            className={`absolute ${
              star.type === 'constellation' ? 'animate-constellation-float' :
              star.type === 'planet' ? 'animate-cosmic-pulse' :
              'animate-shimmer'
            }`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`,
            }}
          >
            <div 
              className={`w-full h-full rounded-full ${
                star.type === 'constellation' ? 'bg-gradient-to-r from-accent via-yellow-400 to-accent' :
                star.type === 'planet' ? 'bg-gradient-to-r from-primary via-secondary to-accent' :
                'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500'
              }`}
              style={{
                opacity: star.type === 'constellation' ? 0.8 : star.type === 'planet' ? 0.9 : 0.6
              }}
            />
          </div>
        ))}
      </div>

      {/* Dark mode stars */}
      <div className="absolute inset-0 hidden dark:block">
        {stars.map((star) => (
          <div
            key={`dark-${star.id}`}
            className={`absolute ${
              star.type === 'constellation' ? 'animate-constellation-float' :
              star.type === 'planet' ? 'animate-cosmic-pulse' :
              'animate-twinkle'
            }`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`,
            }}
          >
            <div 
              className={`w-full h-full rounded-full ${
                star.type === 'constellation' ? 'bg-gradient-to-r from-accent via-yellow-400 to-accent' :
                star.type === 'planet' ? 'bg-gradient-to-r from-primary via-secondary to-accent' :
                'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600'
              }`}
              style={{
                opacity: star.type === 'constellation' ? 0.9 : star.type === 'planet' ? 1 : 0.7
              }}
            />
          </div>
        ))}
      </div>

      {/* Constellation Lines */}
      <svg className="absolute inset-0 w-full h-full dark:hidden">
        <defs>
          <linearGradient id="constellationGradientLight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="50%" stopColor="var(--secondary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        {/* Random constellation lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const x1 = Math.random() * 100
          const y1 = Math.random() * 100
          const x2 = Math.random() * 100
          const y2 = Math.random() * 100
          return (
            <line
              key={i}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="url(#constellationGradientLight)"
              strokeWidth="1"
              opacity="0.3"
              className="animate-pulse"
            />
          )
        })}
      </svg>

      <svg className="absolute inset-0 w-full h-full hidden dark:block">
        <defs>
          <linearGradient id="constellationGradientDark" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" />
            <stop offset="50%" stopColor="var(--secondary)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        {/* Random constellation lines */}
        {Array.from({ length: 8 }).map((_, i) => {
          const x1 = Math.random() * 100
          const y1 = Math.random() * 100
          const x2 = Math.random() * 100
          const y2 = Math.random() * 100
          return (
            <line
              key={i}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="url(#constellationGradientDark)"
              strokeWidth="1"
              opacity="0.4"
              className="animate-pulse"
            />
          )
        })}
      </svg>
    </div>
  )
}
