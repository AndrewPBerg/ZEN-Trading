"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, isAuthenticated, logout as authLogout, fetchCurrentUser } from "@/lib/api/auth"
import { isDemoMode, getCompleteDemoUser, clearDemoMode } from "@/lib/demo-mode"

interface UserProfile {
  zodiac_sign: string
  zodiac_symbol: string
  zodiac_element: string
  date_of_birth: string
  investing_style: string
  onboarding_completed: boolean
}

interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  date_joined: string
  is_active: boolean
  profile?: UserProfile
}

export function useAuth() {
  // Initialize user state immediately with localStorage data (synchronous)
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    
    if (isAuthenticated()) {
      return getCurrentUser()
    } else if (isDemoMode()) {
      return getCompleteDemoUser()
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      // Re-check auth state (in case of changes)
      if (isAuthenticated()) {
        console.log('🔐 useAuth: Fetching fresh user data from API...')
        const freshUser = await fetchCurrentUser()
        if (freshUser) {
          setUser(freshUser)
        } else {
          // Fallback to localStorage if API call fails
          const currentUser = getCurrentUser()
          setUser(currentUser)
        }
      } 
      else if (isDemoMode()) {
        const demoUser = getCompleteDemoUser()
        setUser(demoUser)
      } 
      else {
        setUser(null)
      }
    }

    // Initial check
    checkAuth()

    // Refresh user data every 5 seconds to pick up profile changes
    const refreshInterval = setInterval(() => {
      if (isAuthenticated()) {
        console.log('🔐 useAuth: Periodic user refresh...')
        fetchCurrentUser().then(freshUser => {
          if (freshUser) {
            setUser(freshUser)
          }
        })
      }
    }, 5000) // 5 seconds

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zenTraderUser' || e.key === 'zenTraderTokens' || 
          e.key === 'zenTraderDemoMode' || e.key === 'zenTraderDemoUser') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(refreshInterval)
      window.removeEventListener('storage', handleStorageChange)
    }
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