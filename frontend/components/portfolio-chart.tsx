"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { getPortfolioHistory, type PortfolioHistoryPoint } from "@/lib/api/holdings"

const TIMEFRAMES = ['1D', '5D', '1W', '1M', '3M', '1Y', '5Y'] as const
type Timeframe = typeof TIMEFRAMES[number]

export function PortfolioChart() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1M')
  const [data, setData] = useState<PortfolioHistoryPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      const value = payload[0].value
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
          <p className="text-sm text-primary font-semibold">
            ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          {payload[0].payload.cosmic_vibe_index && (
            <p className="text-xs text-accent mt-1">
              Vibe: {payload[0].payload.cosmic_vibe_index}%
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
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"} />
                  <stop offset="100%" stopColor={isPositive ? "hsl(142, 76%, 56%)" : "hsl(0, 84%, 50%)"} />
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                domain={['dataMin - 1000', 'dataMax + 1000']}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="portfolio_value"
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
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
