"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, ResponsiveContainer, ReferenceLine } from "recharts"
import { getStockHistory } from "@/lib/api/holdings"

interface StockSparklineProps {
  ticker: string
  isPositive: boolean
  purchaseDate?: string | null
  accountStartDate?: string | null
}

export function StockSparkline({ ticker, isPositive, purchaseDate, accountStartDate }: StockSparklineProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [ticker])

  const fetchData = async () => {
    setLoading(true)
    
    try {
      const response = await getStockHistory(ticker, '1D')
      // Transform data for the sparkline
      const chartData = response.data.map(point => ({
        timestamp: new Date(point.timestamp).getTime(),
        value: point.close,
        date: point.timestamp
      }))
      setData(chartData)
    } catch (err) {
      console.error(`Failed to fetch sparkline for ${ticker}:`, err)
      // Set empty data on error
      setData([])
    } finally {
      setLoading(false)
    }
  }

  if (loading || data.length === 0) {
    return (
      <div className="h-8 w-16 flex items-center justify-center">
        <div className="w-1 h-1 bg-muted-foreground/20 rounded-full animate-pulse" />
      </div>
    )
  }

  // Calculate timestamps if provided
  const purchaseTimestamp = purchaseDate ? new Date(purchaseDate).getTime() : null
  const accountStartTimestamp = accountStartDate ? new Date(accountStartDate).getTime() : null

  return (
    <div className="relative group">
      <div className="h-8 w-16">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="currentColor"
              strokeWidth={1.5}
              dot={false}
              className={isPositive ? "text-green-500" : "text-red-500"}
            />
            {accountStartTimestamp && (
              <ReferenceLine 
                x={accountStartTimestamp} 
                stroke="hsl(var(--primary))" 
                strokeDasharray="2 2" 
                strokeWidth={1.5}
                label={{ value: "★", position: "top", fill: "hsl(var(--primary))", fontSize: 10 }}
              />
            )}
            {purchaseTimestamp && (
              <ReferenceLine 
                x={purchaseTimestamp} 
                stroke="hsl(var(--accent))" 
                strokeDasharray="3 3" 
                strokeWidth={1}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 pointer-events-none">
        <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap border border-border">
          {accountStartTimestamp && <div className="flex items-center gap-1"><span className="text-primary">★</span> Account Started</div>}
          {purchaseTimestamp && <div className="flex items-center gap-1"><span className="text-accent">-</span> Purchase Date</div>}
        </div>
      </div>
    </div>
  )
}

