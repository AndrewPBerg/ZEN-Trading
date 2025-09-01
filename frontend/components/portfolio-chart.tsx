"use client"

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"

// Mock portfolio performance data
const generatePortfolioData = () => {
  const data = []
  let baseValue = 12000

  for (let i = 30; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const variation = (Math.random() - 0.4) * 500 // Slight upward bias
    baseValue += variation
    const vibeIndex = Math.max(60, Math.min(95, 78 + (Math.random() - 0.5) * 20))

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      value: Math.max(baseValue, 10000),
      vibeIndex: Math.round(vibeIndex),
    })
  }

  return data
}

export function PortfolioChart() {
  const data = generatePortfolioData()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-primary">
            Value: <span className="font-semibold">${payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-accent">
            Vibe Index: <span className="font-semibold">{payload[1]?.value || payload[0].payload.vibeIndex}%</span>
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Portfolio Performance</h3>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full" />
            <span className="text-muted-foreground">Value</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-accent rounded-full" />
            <span className="text-muted-foreground">Vibe Index</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--secondary))" />
              </linearGradient>
              <linearGradient id="vibeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              yAxisId="value"
              orientation="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              domain={["dataMin - 500", "dataMax + 500"]}
            />
            <YAxis
              yAxisId="vibe"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              domain={[50, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              yAxisId="value"
              type="monotone"
              dataKey="value"
              stroke="url(#portfolioGradient)"
              strokeWidth={3}
              dot={false}
              activeDot={{
                r: 4,
                fill: "hsl(var(--primary))",
                stroke: "hsl(var(--background))",
                strokeWidth: 2,
              }}
            />
            <Line
              yAxisId="vibe"
              type="monotone"
              dataKey="vibeIndex"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{
                r: 3,
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
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
          <span>Portfolio trending upward</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse delay-300" />
          <span>Cosmic alignment strong</span>
        </div>
      </div>
    </div>
  )
}
