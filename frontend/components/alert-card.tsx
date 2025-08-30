"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Star, AlertTriangle, X } from "lucide-react"

interface Alert {
  id: number
  ticker: string
  message: string
  type: "surge" | "alignment" | "warning"
  time: string
  isNew: boolean
}

interface AlertCardProps {
  alert: Alert
}

export function AlertCard({ alert }: AlertCardProps) {
  const getAlertIcon = () => {
    switch (alert.type) {
      case "surge":
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case "alignment":
        return <Star className="w-4 h-4 text-accent" fill="currentColor" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-orange-500" />
      default:
        return <Star className="w-4 h-4 text-accent" />
    }
  }

  const getAlertColor = () => {
    switch (alert.type) {
      case "surge":
        return "from-green-500/10 to-green-500/5 border-green-500/30"
      case "alignment":
        return "from-accent/10 to-accent/5 border-accent/30"
      case "warning":
        return "from-orange-500/10 to-orange-500/5 border-orange-500/30"
      default:
        return "from-primary/10 to-primary/5 border-primary/30"
    }
  }

  return (
    <Card className={`p-4 bg-gradient-to-r ${getAlertColor()} backdrop-blur-sm relative`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getAlertIcon()}</div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs px-2 py-0">
              {alert.ticker}
            </Badge>
            {alert.isNew && <Badge className="text-xs px-2 py-0 bg-red-500 text-white">NEW</Badge>}
          </div>
          <p className="text-sm text-foreground leading-relaxed">{alert.message}</p>
          <p className="text-xs text-muted-foreground">{alert.time}</p>
        </div>
        <Button variant="ghost" size="sm" className="p-1 h-auto">
          <X className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  )
}
