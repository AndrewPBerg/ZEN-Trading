"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { getStockHistory, type StockHistoryData } from "@/lib/api/stocks"
import { useTheme } from "next-themes"

const TIMEFRAMES = ['1D', '5D', '1W', '1M', '3M', '1Y', '5Y'] as const
type Timeframe = typeof TIMEFRAMES[number]

interface StockChartProps {
  ticker: string
  alignmentScore?: number
}

export function StockChart({ ticker, alignmentScore = 65 }: StockChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1M')
  const [data, setData] = useState<StockHistoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme, systemTheme } = useTheme()
  const currentTheme = theme === 'system' ? systemTheme : theme

  useEffect(() => {
    fetchData()
  }, [ticker, selectedTimeframe])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await getStockHistory(ticker, selectedTimeframe)
      setData(response.data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chart data'
      setError(errorMessage)
      console.error('Failed to fetch stock history:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatXAxis = (timestamp: string) => {
    const date = new Date(timestamp)
    
    switch (selectedTimeframe) {
      case '1D':
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
      case '5D':
      case '1W':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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

  // Get gradient colors based on alignment score
  const getAlignmentGradient = () => {
    if (alignmentScore >= 80) {
      return {
        start: "hsl(var(--accent))", // Gold
        end: "hsl(142, 76%, 36%)", // Green
      }
    } else if (alignmentScore >= 50) {
      return {
        start: "hsl(var(--primary))", // Purple
        end: "hsl(var(--secondary))", // Turquoise
      }
    } else {
      return {
        start: "hsl(var(--destructive))", // Red
        end: "hsl(0, 70%, 45%)", // Darker red
      }
    }
  }

  const alignmentGradient = getAlignmentGradient()

  // Detect key points (local minima/maxima and significant moves)
  const detectKeyPoints = () => {
    if (data.length < 3) return new Set<number>()
    
    const keyPoints = new Set<number>()
    
    for (let i = 1; i < data.length - 1; i++) {
      const prev = data[i - 1].close
      const curr = data[i].close
      const next = data[i + 1].close
      
      // Local maximum
      if (curr > prev && curr > next) {
        keyPoints.add(i)
      }
      // Local minimum
      if (curr < prev && curr < next) {
        keyPoints.add(i)
      }
      
      // Significant price movement (>5% from previous)
      const priceChange = Math.abs((curr - prev) / prev)
      if (priceChange > 0.05) {
        keyPoints.add(i)
      }
    }
    
    return keyPoints
  }

  const keyPoints = detectKeyPoints()

  const calculateChange = () => {
    if (data.length < 2) return { amount: 0, percent: 0 }
    
    const firstValue = data[0].close
    const lastValue = data[data.length - 1].close
    const amount = lastValue - firstValue
    const percent = (amount / firstValue) * 100
    
    return { amount, percent }
  }

  const change = calculateChange()
  const isPositive = change.amount >= 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const date = new Date(label)
      
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
          <div className="space-y-1">
            <p className="text-sm text-foreground font-semibold">
              Close: ${data.close.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              Open: ${data.open.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              High: ${data.high.toFixed(2)} / Low: ${data.low.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              Vol: {(data.volume / 1000000).toFixed(1)}M
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs font-medium" style={{ color: alignmentGradient.start }}>
              Alignment: {alignmentScore}%
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  // Custom dot for key points
  const CustomDot = (props: any) => {
    const { cx, cy, index } = props
    if (!keyPoints.has(index)) return null
    
    const isMaxima = index > 0 && index < data.length - 1 && 
                     data[index].close > data[index - 1].close && 
                     data[index].close > data[index + 1].close
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={isMaxima ? "hsl(var(--accent))" : alignmentGradient.start}
        stroke="hsl(var(--background))"
        strokeWidth={2}
        opacity={0.8}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with alignment badge and change */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Price Chart</h3>
          {!loading && !error && data.length > 0 && (
            <div className={`flex items-center gap-2 text-sm mt-1`}>
              <span className={`font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {isPositive ? '+' : ''}${Math.abs(change.amount).toFixed(2)} ({isPositive ? '+' : ''}{change.percent.toFixed(2)}%)
              </span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs font-medium" style={{ color: alignmentGradient.start }}>
                {alignmentScore}% Aligned
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
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                {/* Alignment-based gradient */}
                <linearGradient id={`alignmentGradient-${ticker}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={alignmentGradient.start} />
                  <stop offset="100%" stopColor={alignmentGradient.end} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={formatXAxis}
                minTickGap={30}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                domain={['dataMin - 5', 'dataMax + 5']}
                tickFormatter={(value) => `$${value.toFixed(0)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="close"
                stroke={`url(#alignmentGradient-${ticker})`}
                strokeWidth={2.5}
                dot={<CustomDot />}
                activeDot={{
                  r: 5,
                  fill: alignmentGradient.start,
                  stroke: "hsl(var(--background))",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: alignmentGradient.start }} />
          <span>
            {alignmentScore >= 80 ? 'High Alignment' : alignmentScore >= 50 ? 'Medium Alignment' : 'Low Alignment'}
          </span>
        </div>
        {keyPoints.size > 0 && (
          <>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-accent rounded-full" />
              <span>Key Points</span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
