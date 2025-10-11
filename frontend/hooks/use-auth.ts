"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, isAuthenticated, logout as authLogout } from "@/lib/api/auth"
import { isDemoMode, getCompleteDemoUser, clearDemoMode } from "@/lib/demo-mode"

interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  date_joined: string
  is_active: boolean
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      // First check if authenticated
      if (isAuthenticated()) {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } 
      // Then check if in demo mode
      else if (isDemoMode()) {
        const demoUser = getCompleteDemoUser()
        setUser(demoUser)
      } 
      // No authentication or demo mode
      else {
        setUser(null)
      }
      setIsLoading(false)
    }

    checkAuth()

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zenTraderUser' || e.key === 'zenTraderTokens' || 
          e.key === 'zenTraderDemoMode' || e.key === 'zenTraderDemoUser') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const logout = () => {
    // Clear both auth and demo mode
    authLogout()
    clearDemoMode()
    setUser(null)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout
  }
}