"use client"

import { useEffect, useState } from "react"

interface Star {
  id: number
  x: number
  y: number
  size: number
  animationDelay: number
  animationDuration: number
  type: 'twinkle' | 'shimmer' | 'float' | 'pulse'
  opacity: number
}

export function AnimatedStars() {
  const [stars, setStars] = useState<Star[]>([])

  useEffect(() => {
    // Generate random stars with different types
    const generateStars = () => {
      const newStars: Star[] = []
      const starCount = 80

      for (let i = 0; i < starCount; i++) {
        const types: Star['type'][] = ['twinkle', 'shimmer', 'float', 'pulse']
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          animationDelay: Math.random() * 8,
          animationDuration: Math.random() * 4 + 3,
          type: types[Math.floor(Math.random() * types.length)],
          opacity: Math.random() * 0.8 + 0.2,
        })
      }
      setStars(newStars)
    }

    generateStars()
  }, [])

  const getStarAnimation = (type: Star['type']) => {
    switch (type) {
      case 'twinkle':
        return 'animate-twinkle'
      case 'shimmer':
        return 'animate-shimmer'
      case 'float':
        return 'animate-float-gentle'
      case 'pulse':
        return 'animate-pulse-slow'
      default:
        return 'animate-pulse'
    }
  }

  const getStarGradient = (type: Star['type'], isDark: boolean) => {
    if (isDark) {
      switch (type) {
        case 'twinkle':
          return 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600'
        case 'shimmer':
          return 'bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-600'
        case 'float':
          return 'bg-gradient-to-r from-pink-400 via-rose-500 to-pink-600'
        case 'pulse':
          return 'bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600'
        default:
          return 'bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600'
      }
    } else {
      switch (type) {
        case 'twinkle':
          return 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500'
        case 'shimmer':
          return 'bg-gradient-to-r from-blue-300 via-cyan-400 to-blue-500'
        case 'float':
          return 'bg-gradient-to-r from-pink-300 via-rose-400 to-pink-500'
        case 'pulse':
          return 'bg-gradient-to-r from-orange-300 via-amber-400 to-orange-500'
        default:
          return 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500'
      }
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Enhanced cosmic background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 animate-aurora" />
      
      {/* Light mode stars */}
      <div className="absolute inset-0 dark:hidden">
        {stars.map((star) => (
          <div
            key={`light-${star.id}`}
            className={`absolute ${getStarAnimation(star.type)}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`,
              opacity: star.opacity,
            }}
          >
            <div className={`w-full h-full ${getStarGradient(star.type, false)} rounded-full shadow-cosmic`} />
          </div>
        ))}
      </div>

      {/* Dark mode stars */}
      <div className="absolute inset-0 hidden dark:block">
        {stars.map((star) => (
          <div
            key={`dark-${star.id}`}
            className={`absolute ${getStarAnimation(star.type)}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.animationDelay}s`,
              animationDuration: `${star.animationDuration}s`,
              opacity: star.opacity,
            }}
          >
            <div className={`w-full h-full ${getStarGradient(star.type, true)} rounded-full shadow-cosmic`} />
          </div>
        ))}
      </div>

      {/* Shooting stars */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-1 h-1 bg-white rounded-full animate-ping opacity-0" 
             style={{ animationDelay: '2s', animationDuration: '3s' }} />
        <div className="absolute top-1/3 right-0 w-1 h-1 bg-accent rounded-full animate-ping opacity-0" 
             style={{ animationDelay: '5s', animationDuration: '2s' }} />
        <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-secondary rounded-full animate-ping opacity-0" 
             style={{ animationDelay: '8s', animationDuration: '2.5s' }} />
      </div>
    </div>
  )
}
