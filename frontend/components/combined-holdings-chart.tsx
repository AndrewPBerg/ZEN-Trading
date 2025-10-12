"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts"

// Generate normalized chart data for multiple tickers
const generateCombinedChartData = (tickers: string[]) => {
  const data = []
  const colors = [
    "#8b5cf6", // purple
    "#06b6d4", // cyan
    "#f59e0b", // amber
    "#ec4899", // pink
    "#10b981", // emerald
    "#f97316", // orange
  ]

  // Generate 30 days of data
  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    
    const dataPoint: any = {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    }

    // Generate price data for each ticker (normalized to 100 as starting point)
    tickers.forEach((ticker, index) => {
      const trend = Math.sin(i / 5 + index) * 10 // Create different trends
      const variation = (Math.random() - 0.5) * 5
      const price = 100 + trend + variation + (30 - i) * 0.5 // Slight upward trend
      dataPoint[ticker] = Math.max(price, 80)
    })

    data.push(dataPoint)
  }

  return { data, colors }
}

interface CombinedHoldingsChartProps {
  tickers: string[]
  holdings?: Array<{ ticker: string; alignment_score?: number; element?: string }>
}

export function CombinedHoldingsChart({ tickers, holdings = [] }: CombinedHoldingsChartProps) {
  const { data, colors } = generateCombinedChartData(tickers)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
          <p className="text-xs font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="font-medium text-foreground">{entry.dataKey}</span>
                </div>
                <span className="text-muted-foreground">
                  {entry.value.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Combined Performance (30 Days)</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Normalized to 100</span>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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
              label={{ 
                value: "Normalized Price (%)", 
                angle: -90, 
                position: "insideLeft",
                style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: 12 }}
              iconType="circle"
            />
            {tickers.map((ticker, index) => (
              <Line
                key={ticker}
                type="monotone"
                dataKey={ticker}
                stroke={colors[index % colors.length]}
                strokeWidth={2}
                dot={false}
                activeDot={{
                  r: 4,
                  fill: colors[index % colors.length],
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Alignment Summary */}
      {holdings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {holdings.map((holding, index) => (
            <div 
              key={holding.ticker}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/30"
            >
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{holding.ticker}</p>
                {holding.alignment_score !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    {holding.alignment_score}% aligned
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <span>Performance normalized to starting value of 100</span>
        </div>
      </div>
    </div>
  )
}
