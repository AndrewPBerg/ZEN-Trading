import type * as React from "react"
import { cn } from "@/lib/utils"

function TarotCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tarot-card"
      className={cn(
        "relative bg-gradient-to-br from-card via-card to-card/80 text-card-foreground",
        "border-2 border-accent/30 rounded-lg shadow-xl",
        "before:absolute before:inset-1 before:border before:border-accent/20 before:rounded-md before:pointer-events-none",
        "after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-accent/5 after:to-primary/10 after:rounded-lg after:pointer-events-none",
        "overflow-hidden backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  )
}

function TarotCardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tarot-card-header"
      className={cn(
        "relative z-10 p-4 border-b border-accent/20",
        "bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10",
        "before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-8 before:h-1 before:bg-accent/40 before:rounded-full",
        "after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-12 after:h-px after:bg-gradient-to-r after:from-transparent after:via-accent/40 after:to-transparent",
        className,
      )}
      {...props}
    />
  )
}

function TarotCardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tarot-card-title"
      className={cn(
        "text-center font-bold text-lg bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent",
        "drop-shadow-sm",
        className,
      )}
      {...props}
    />
  )
}

function TarotCardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tarot-card-content"
      className={cn("relative z-10 p-4 space-y-3", "bg-gradient-to-b from-transparent to-background/20", className)}
      {...props}
    />
  )
}

function TarotCardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="tarot-card-footer"
      className={cn(
        "relative z-10 p-4 border-t border-accent/20",
        "bg-gradient-to-r from-secondary/10 via-accent/5 to-primary/10",
        "before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-12 before:h-px before:bg-gradient-to-r before:from-transparent before:via-accent/40 before:to-transparent",
        className,
      )}
      {...props}
    />
  )
}

// Decorative corner elements for tarot cards
function TarotCorners({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      {/* Top corners */}
      <div className="absolute top-2 left-2 w-3 h-3 border-l-2 border-t-2 border-accent/40" />
      <div className="absolute top-2 right-2 w-3 h-3 border-r-2 border-t-2 border-accent/40" />
      {/* Bottom corners */}
      <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-accent/40" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-accent/40" />
      {/* Center mystical symbol */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent/60 rounded-full" />
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-accent/60 rounded-full" />
    </div>
  )
}

export { TarotCard, TarotCardHeader, TarotCardTitle, TarotCardContent, TarotCardFooter, TarotCorners }
