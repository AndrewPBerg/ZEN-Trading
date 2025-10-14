"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface CompatibilityPieChartProps {
  alignmentBreakdown: {
    same_sign: number
    positive: number
    neutral: number
    negative: number
  }
}

const COLORS = {
  same_sign: "hsl(280, 100%, 70%)", // Purple for same sign
  positive: "hsl(142, 76%, 36%)",   // Green for positive
  neutral: "hsl(45, 93%, 47%)",     // Yellow for neutral
  negative: "hsl(25, 95%, 53%)",    // Orange for negative
}

const LABELS = {
  same_sign: "Same Sign",
  positive: "Positive Match",
  neutral: "Neutral Match",
  negative: "Challenging Match",
}

export function CompatibilityPieChart({ alignmentBreakdown }: CompatibilityPieChartProps) {
  // Transform data for pie chart
  const chartData = Object.entries(alignmentBreakdown)
    .map(([key, value]) => ({
      name: LABELS[key as keyof typeof LABELS],
      value,
      key,
    }))
    .filter(item => item.value > 0) // Only show categories with values

  const totalHoldings = Object.values(alignmentBreakdown).reduce((sum, val) => sum + val, 0)

  if (totalHoldings === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        No holdings to display
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / totalHoldings) * 100).toFixed(1)
      
      return (
        <div className="bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-primary">
            {data.value} holding{data.value !== 1 ? 's' : ''} ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / totalHoldings) * 100).toFixed(0)
          return (
            <div key={`legend-${index}`} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-xs text-muted-foreground">
                {entry.value} ({percentage}%)
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  // Calculate summary text
  const getSummaryText = () => {
    const sameSignPercent = ((alignmentBreakdown.same_sign / totalHoldings) * 100).toFixed(0)
    const positivePercent = ((alignmentBreakdown.positive / totalHoldings) * 100).toFixed(0)
    const totalPositive = alignmentBreakdown.same_sign + alignmentBreakdown.positive
    const totalPositivePercent = ((totalPositive / totalHoldings) * 100).toFixed(0)

    if (alignmentBreakdown.same_sign > 0 && alignmentBreakdown.positive > 0) {
      return `${totalPositivePercent}% of your portfolio is cosmically aligned`
    } else if (alignmentBreakdown.same_sign > 0) {
      return `${sameSignPercent}% share your zodiac sign`
    } else if (alignmentBreakdown.positive > 0) {
      return `${positivePercent}% of your portfolio aligns positively`
    } else if (alignmentBreakdown.neutral > 0) {
      return `Your portfolio has balanced cosmic energy`
    } else {
      return `Consider exploring more aligned stocks`
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-sm font-semibold text-foreground mb-1">Cosmic Compatibility</h3>
        <p className="text-xs text-muted-foreground">{getSummaryText()}</p>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={70}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.key as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

