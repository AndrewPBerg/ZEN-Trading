"use client"

import React from "react"
import TarotCard from "@/components/testing-styles"

export default function DemosPage() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6">Demo Components</h1>
      <TarotCard
        title="The Magician"
        subtitle="Manifestation • Resourcefulness • Power"
      >
        <p>
          The Magician is a card of manifestation and resourcefulness. It reminds you that you have all the tools you need to create your desired reality. Take action and trust in your abilities.
        </p>
      </TarotCard>
    </main>
  )
}
