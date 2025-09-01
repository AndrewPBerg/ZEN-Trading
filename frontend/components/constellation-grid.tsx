"use client"

import { Sparkles } from "lucide-react"

interface Stock {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  alignment: number
  zodiacMatch: string
  element: string
  logo: string
  position: { x: number; y: number }
  alertActive: boolean
}

interface ConstellationGridProps {
  stocks: Stock[]
  selectedStock: string | null
  onSelectStock: (ticker: string | null) => void
}

export function ConstellationGrid({ stocks, selectedStock, onSelectStock }: ConstellationGridProps) {
  const gridSize = 7 // 7x7 grid
  const cellSize = 40 // Size of each cell in pixels

  // Create connections between nearby stocks
  const getConnections = () => {
    const connections: Array<{ from: Stock; to: Stock }> = []

    stocks.forEach((stock1) => {
      stocks.forEach((stock2) => {
        if (stock1.ticker !== stock2.ticker) {
          const distance = Math.sqrt(
            Math.pow(stock1.position.x - stock2.position.x, 2) + Math.pow(stock1.position.y - stock2.position.y, 2),
          )

          // Connect stocks that are close to each other
          if (distance <= 2.5 && distance > 0) {
            const existingConnection = connections.find(
              (conn) =>
                (conn.from.ticker === stock1.ticker && conn.to.ticker === stock2.ticker) ||
                (conn.from.ticker === stock2.ticker && conn.to.ticker === stock1.ticker),
            )

            if (!existingConnection) {
              connections.push({ from: stock1, to: stock2 })
            }
          }
        }
      })
    })

    return connections
  }

  const connections = getConnections()

  const getAlignmentColor = (alignment: number) => {
    if (alignment >= 85) return "text-green-500 border-green-500/30"
    if (alignment >= 75) return "text-yellow-500 border-yellow-500/30"
    return "text-orange-500 border-orange-500/30"
  }

  return (
    <div className="relative w-full aspect-square max-w-sm mx-auto">
      {/* Grid Background */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: gridSize + 1 }).map((_, i) => (
          <div key={`h-${i}`}>
            <div
              className="absolute w-full border-t border-muted-foreground/20"
              style={{ top: `${(i / gridSize) * 100}%` }}
            />
            <div
              className="absolute h-full border-l border-muted-foreground/20"
              style={{ left: `${(i / gridSize) * 100}%` }}
            />
          </div>
        ))}
      </div>

      {/* Constellation Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {connections.map((connection, index) => {
          const x1 = (connection.from.position.x / gridSize) * 100
          const y1 = (connection.from.position.y / gridSize) * 100
          const x2 = (connection.to.position.x / gridSize) * 100
          const y2 = (connection.to.position.y / gridSize) * 100

          return (
            <line
              key={index}
              x1={`${x1}%`}
              y1={`${y1}%`}
              x2={`${x2}%`}
              y2={`${y2}%`}
              stroke="hsl(var(--primary))"
              strokeWidth="1"
              strokeOpacity="0.3"
              strokeDasharray="2 2"
            />
          )
        })}
      </svg>

      {/* Stock Stars */}
      {stocks.map((stock) => {
        const isSelected = selectedStock === stock.ticker
        const isPositive = stock.change >= 0

        return (
          <button
            key={stock.ticker}
            className={`absolute w-12 h-12 rounded-full border-2 transition-all duration-300 hover:scale-110 ${
              isSelected
                ? "bg-primary text-white border-primary shadow-lg scale-110"
                : `bg-background/90 backdrop-blur-sm ${getAlignmentColor(stock.alignment)} hover:shadow-md`
            }`}
            style={{
              left: `${(stock.position.x / gridSize) * 100}%`,
              top: `${(stock.position.y / gridSize) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => onSelectStock(isSelected ? null : stock.ticker)}
          >
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Alert indicator */}
              {stock.alertActive && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}

              {/* Stock logo or symbol */}
              <span className="text-lg">{stock.logo}</span>

              {/* Sparkle effect for high alignment */}
              {stock.alignment >= 90 && (
                <Sparkles className="absolute -top-1 -left-1 w-3 h-3 text-accent animate-pulse" />
              )}
            </div>
          </button>
        )
      })}

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}
