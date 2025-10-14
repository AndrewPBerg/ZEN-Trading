import { refreshToken, logout } from '@/lib/api/auth'

/**
 * Helper to get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('zenTraderTokens')
    if (!stored) return null
    const tokens = JSON.parse(stored)
    return tokens.access || null
  } catch {
    return null
  }
}

/**
 * Helper to make authenticated fetch requests with automatic token refresh
 * Automatically retries once with a refreshed token if the first request returns 401
 * If the retry also fails with 401, logs the user out and redirects to login
 */
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken()
  console.log('Auth token exists:', !!token)
  console.log('Auth token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'null')
  
  if (!token) {
    // Clear any stale auth state and redirect to login
    logout()
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new Error('Authentication required. Please log in first.')
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    Authorization: `Bearer ${token}`,
  }
  console.log('Request URL:', url)
  console.log('Request headers:', { ...headers, Authorization: headers.Authorization.substring(0, 30) + '...' })

  let response = await fetch(url, {
    ...options,
    headers,
  })

  console.log('Response status:', response.status)

  // If we get a 401, try refreshing the token and retry once
  if (response.status === 401) {
    console.log('Got 401, attempting to refresh token...')
    const newTokens = await refreshToken()
    
    if (newTokens) {
      console.log('Token refreshed successfully, retrying request...')
      // Retry with new token
      const newHeaders = {
        ...headers,
        Authorization: `Bearer ${newTokens.access}`,
      }
      response = await fetch(url, {
        ...options,
        headers: newHeaders,
      })
      console.log('Retry response status:', response.status)
      
      // If still 401 after refresh, clear auth and redirect
      if (response.status === 401) {
        console.log('Still 401 after token refresh, logging out...')
        logout()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        throw new Error('Authentication expired. Please log in again.')
      }
    } else {
      console.log('Token refresh failed, logging out...')
      // Token refresh failed, clear auth and redirect
      logout()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
      throw new Error('Session expired. Please log in again.')
    }
  }

  return response
}

