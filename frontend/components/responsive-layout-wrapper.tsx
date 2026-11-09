"use client"

import { useResponsiveLayout } from "@/lib/responsive-utils"

interface ResponsiveLayoutWrapperProps {
  children: React.ReactNode
}

export function ResponsiveLayoutWrapper({ children }: ResponsiveLayoutWrapperProps) {
  const { containerPadding } = useResponsiveLayout()

  return (
    <main className={`flex-1 ${containerPadding}`}>
      {children}
    </main>
  )
}