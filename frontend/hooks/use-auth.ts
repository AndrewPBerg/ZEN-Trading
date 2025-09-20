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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser()
        setUser(currentUser)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const logout = () => {
    authLogout()
    setUser(null)
  }

  return {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
  }
}
