"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

// Mock chart data
const generateChartData = (ticker: string) => {
  const basePrice = ticker === "AAPL" ? 175 : 250
  const data = []

  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const variation = (Math.random() - 0.5) * 10
    const price = basePrice + variation + (Math.random() - 0.5) * 20

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      price: Math.max(price, basePrice * 0.8),
      volume: Math.floor(Math.random() * 50000000) + 10000000,
    })
  }

  return data
}

interface StockChartProps {
  ticker: string
}

export function StockChart({ ticker }: StockChartProps) {
  const data = generateChartData(ticker)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-primary">
            Price: <span className="font-semibold">${payload[0].value.toFixed(2)}</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Price Chart (30 Days)</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full" />
          <span className="text-xs text-muted-foreground">Cosmic Trend</span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="cosmicGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              domain={["dataMin - 5", "dataMax + 5"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="price"
              stroke="url(#cosmicGradient)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: "hsl(var(--accent))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span>Cosmic alignment: Strong</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse delay-300" />
          <span>Trend: Ascending</span>
        </div>
      </div>
    </div>
  )
}
