"use client"

import { useState, useEffect } from "react"
import { getCurrentUser, isAuthenticated, logout as authLogout } from "@/lib/api/auth"

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
      if (isAuthenticated()) {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }

    checkAuth()

    // Listen for storage changes (e.g., when user logs in/out in another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'zenTraderUser' || e.key === 'zenTraderTokens') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const logout = () => {
    authLogout()
    setUser(null)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout
  }
}