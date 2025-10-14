"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Sparkles } from "lucide-react"

interface AlignmentInfoModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AlignmentInfoModal({ open, onOpenChange }: AlignmentInfoModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[1.5rem]">
            <Sparkles className="w-6 h-6 text-accent" />
            How Cosmic Alignment is Calculated
          </DialogTitle>
          <DialogDescription className="text-[1.125rem]">
            Understanding your stock compatibility scores
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 text-[1.2rem]">
          <div>
            <h4 className="font-semibold text-foreground mb-2 text-[1.2rem]">Alignment Scoring</h4>
            <p className="text-muted-foreground mb-2 text-[1.2rem]">
              Each stock receives an alignment score based on zodiac compatibility with your sign:
            </p>
            <ul className="space-y-1 text-muted-foreground ml-4 text-[1.2rem]">
              <li>• <span className="text-purple-400 font-medium">Same Sign (100%):</span> Stock matches your zodiac sign exactly</li>
              <li>• <span className="text-green-400 font-medium">Positive Match (85%):</span> Highly compatible zodiac pairing</li>
              <li>• <span className="text-yellow-400 font-medium">Neutral Match (65%):</span> Moderate compatibility</li>
              <li>• <span className="text-orange-400 font-medium">Negative Match (40%):</span> Challenging cosmic aspects</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2 text-[1.2rem]">Portfolio Alignment</h4>
            <p className="text-muted-foreground text-[1.2rem]">
              When you own multiple stocks, your portfolio's overall alignment is calculated as a weighted average 
              based on the current value of each position. Larger positions have more influence on your overall cosmic energy.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-2 text-[1.2rem]">Cosmic Vibe Index</h4>
            <p className="text-muted-foreground text-[1.2rem]">
              The Cosmic Vibe Index combines your alignment score with a diversity bonus (up to +15 points) 
              for having stocks across multiple elements (Fire, Earth, Air, Water), promoting balance in your cosmic portfolio.
            </p>
          </div>

          <div className="p-4 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm text-[1.08rem] text-muted-foreground">
              <span className="font-semibold text-accent">Pro Tip:</span> Diversifying across compatible zodiac signs 
              and elements can maximize your Cosmic Vibe Index while maintaining strong alignment.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

