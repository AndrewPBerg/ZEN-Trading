"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceArea, ReferenceDot } from "recharts"
import { Button } from "@/components/ui/button"
import { Loader2, Star } from "lucide-react"
import { getPortfolioHistory, type PortfolioHistoryPoint } from "@/lib/api/holdings"
import { useTheme } from "next-themes"

const TIMEFRAMES = ['1D', '5D', '1W', '1M', '3M', '1Y', '5Y'] as const
type Timeframe = typeof TIMEFRAMES[number]

interface PortfolioChartProps {
  accountStartDate?: string | null
}

export function PortfolioChart({ accountStartDate }: PortfolioChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1M')
  const [data, setData] = useState<PortfolioHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    fetchData()
  }, [selectedTimeframe])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await getPortfolioHistory(selectedTimeframe)
      setData(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chart data'
      
      // If portfolio not found, user hasn't completed onboarding
      if (errorMessage.includes('Portfolio history not found')) {
        setError('Complete onboarding to see your portfolio history')
      } else {
        setError(errorMessage)
      }
      
      console.error('Failed to fetch portfolio history:', err)
    } finally {
      setLoading(false)
    }
  }

  // Get gradient color based on vibe index
  const getVibeGradientColor = (vibeIndex: number) => {
    if (vibeIndex < 40) {
      return currentTheme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)' // Red
    } else if (vibeIndex < 70) {
      return currentTheme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)' // Purple
    } else {
      return currentTheme === 'dark' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)' // Green
    }
  }

  // Calculate average vibe index for background color
  const averageVibeIndex = data.length > 0 
    ? data.reduce((sum, point) => sum + (point.cosmic_vibe_index || 50), 0) / data.length 
    : 50

  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp)
    
    switch (selectedTimeframe) {
      case '1D':
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      case '5D':
      case '1W':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric' })
      case '1M':
      case '3M':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      case '1Y':
        return date.toLocaleDateString('en-US', { month: 'short' })
      case '5Y':
        return date.toLocaleDateString('en-US', { year: '2-digit', month: 'short' })
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const calculateChange = () => {
    if (data.length < 2) return { amount: 0, percent: 0 }
    
    const firstValue = data[0].portfolio_value
    const lastValue = data[data.length - 1].portfolio_value
    const amount = lastValue - firstValue
    const percent = (amount / firstValue) * 100
    
    return { amount, percent }
  }

  const change = calculateChange()
  const isPositive = change.amount >= 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const portfolioPayload = payload.find((p: any) => p.dataKey === 'portfolio_value')
      const vibePayload = payload.find((p: any) => p.dataKey === 'cosmic_vibe_index')
      const value = portfolioPayload?.value
      const vibeIndex = vibePayload?.value || portfolioPayload?.payload?.cosmic_vibe_index
      const date = new Date(label)
      
      // Determine vibe color
      let vibeColor = 'hsl(var(--primary))'
      if (vibeIndex < 40) vibeColor = 'hsl(var(--destructive))'
      else if (vibeIndex >= 70) vibeColor = 'hsl(var(--accent))'
      
      return (
        <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">
            {date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric',
              hour: selectedTimeframe === '1D' ? 'numeric' : undefined,
              minute: selectedTimeframe === '1D' ? '2-digit' : undefined
            })}
          </p>
          {value !== undefined && (
            <p className="text-sm text-foreground font-semibold">
              ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
          {vibeIndex !== undefined && (
            <p className="text-xs mt-1 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: vibeColor }} />
              <span style={{ color: vibeColor }}>Cosmic Vibe: {vibeIndex}%</span>
            </p>
          )}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Header with Change Badge */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Portfolio Performance</h3>
          {!loading && !error && data.length > 0 && (
            <div className={`flex items-center gap-1 text-sm mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              <span className="font-medium">
                {isPositive ? '+' : ''}${Math.abs(change.amount).toFixed(2)}
              </span>
              <span className="text-xs">
                ({isPositive ? '+' : ''}{change.percent.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {TIMEFRAMES.map((timeframe) => (
          <Button
            key={timeframe}
            variant={selectedTimeframe === timeframe ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedTimeframe(timeframe)}
            className={`text-xs px-3 py-1 ${
              selectedTimeframe === timeframe 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background/50 hover:bg-accent'
            }`}
          >
            {timeframe}
          </Button>
        ))}
      </div>

      {/* Chart or Loading/Error State */}
      {loading ? (
        <div className="h-64 w-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="h-64 w-full flex items-center justify-center">
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 w-full flex items-center justify-center">
          <p className="text-sm text-muted-foreground">No data available</p>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 45, left: 5, bottom: 5 }}>
              <defs>
                {/* Portfolio value gradient */}
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={isPositive ? "hsl(var(--accent))" : "hsl(var(--destructive))"} />
                  <stop offset="100%" stopColor={isPositive ? "hsl(var(--primary))" : "hsl(var(--destructive))"} />
                </linearGradient>
                
                {/* Vibe index background gradient */}
                <linearGradient id="vibeBackgroundGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={getVibeGradientColor(averageVibeIndex)} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={getVibeGradientColor(averageVibeIndex)} stopOpacity={0.1} />
                </linearGradient>

                {/* Vibe index line gradient */}
                <linearGradient id="vibeLineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="hsl(var(--accent))" />
                  <stop offset="50%" stopColor="hsl(var(--secondary))" />
                  <stop offset="100%" stopColor="hsl(var(--primary))" />
                </linearGradient>
              </defs>

              {/* Account start date band */}
              {accountStartDate && (() => {
                const startIndex = data.findIndex(point => point.timestamp === accountStartDate)
                if (startIndex >= 0 && startIndex < data.length - 1) {
                  return (
                    <ReferenceArea
                      x1={data[startIndex].timestamp}
                      x2={data[Math.min(startIndex + 1, data.length - 1)].timestamp}
                      fill="hsl(var(--accent))"
                      fillOpacity={0.15}
                      label={{
                        value: "★ Start",
                        position: "top",
                        fill: "hsl(var(--accent))",
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    />
                  )
                }
                return null
              })()}

              <XAxis
                dataKey="timestamp"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={formatXAxis}
                minTickGap={30}
              />
              
              {/* Primary Y-axis for portfolio value */}
              <YAxis
                yAxisId="portfolio"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                domain={['dataMin - 1000', 'dataMax + 1000']}
              />
              
              {/* Secondary Y-axis for vibe index */}
              <YAxis
                yAxisId="vibe"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--accent))" }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Vibe index background area */}
              <Area
                yAxisId="vibe"
                type="monotone"
                dataKey="cosmic_vibe_index"
                fill="url(#vibeBackgroundGradient)"
                stroke="none"
                fillOpacity={1}
              />

              {/* Portfolio value line */}
              <Line
                yAxisId="portfolio"
                type="monotone"
                dataKey="portfolio_value"
                stroke="url(#portfolioGradient)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: isPositive ? "hsl(var(--accent))" : "hsl(var(--destructive))",
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />

              {/* Vibe index overlay line */}
              <Line
                yAxisId="vibe"
                type="monotone"
                dataKey="cosmic_vibe_index"
                stroke="url(#vibeLineGradient)"
                strokeWidth={2}
                strokeDasharray="5 5"
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
      )}
    </div>
  )
}
