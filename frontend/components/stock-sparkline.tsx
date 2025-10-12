"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { getStockHistory } from "@/lib/api/holdings"

interface StockSparklineProps {
  ticker: string
  isPositive: boolean
}

export function StockSparkline({ ticker, isPositive }: StockSparklineProps) {
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
        value: point.close
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

  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

