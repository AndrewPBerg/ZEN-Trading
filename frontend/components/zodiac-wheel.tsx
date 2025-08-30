"use client"

import { useState } from "react"

const zodiacSigns = [
  { name: "Aries", symbol: "♈", angle: 0, color: "text-red-500" },
  { name: "Taurus", symbol: "♉", angle: 30, color: "text-green-500" },
  { name: "Gemini", symbol: "♊", angle: 60, color: "text-yellow-500" },
  { name: "Cancer", symbol: "♋", angle: 90, color: "text-blue-500" },
  { name: "Leo", symbol: "♌", angle: 120, color: "text-orange-500" },
  { name: "Virgo", symbol: "♍", angle: 150, color: "text-green-600" },
  { name: "Libra", symbol: "♎", angle: 180, color: "text-pink-500" },
  { name: "Scorpio", symbol: "♏", angle: 210, color: "text-red-600" },
  { name: "Sagittarius", symbol: "♐", angle: 240, color: "text-purple-500" },
  { name: "Capricorn", symbol: "♑", angle: 270, color: "text-gray-600" },
  { name: "Aquarius", symbol: "♒", angle: 300, color: "text-blue-400" },
  { name: "Pisces", symbol: "♓", angle: 330, color: "text-teal-500" },
]

export function ZodiacWheel({ size = 200, selectedSign }: { size?: number; selectedSign?: string }) {
  const [hoveredSign, setHoveredSign] = useState<string | null>(null)
  const radius = size / 2 - 20

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20" />

      {zodiacSigns.map((sign) => {
        const radian = (sign.angle * Math.PI) / 180
        const x = radius * Math.cos(radian) + size / 2
        const y = radius * Math.sin(radian) + size / 2

        return (
          <div
            key={sign.name}
            className={`absolute w-6 h-6 flex items-center justify-center rounded-full transition-all duration-300 cursor-pointer ${
              selectedSign === sign.name
                ? "bg-primary text-white scale-125 shadow-lg"
                : hoveredSign === sign.name
                  ? "bg-secondary/20 scale-110"
                  : "bg-background/80 hover:bg-accent/20"
            }`}
            style={{
              left: x - 12,
              top: y - 12,
            }}
            onMouseEnter={() => setHoveredSign(sign.name)}
            onMouseLeave={() => setHoveredSign(null)}
            title={sign.name}
          >
            <span className={`text-sm ${sign.color}`}>{sign.symbol}</span>
          </div>
        )
      })}

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-xs">ZEN</span>
        </div>
      </div>
    </div>
  )
}
