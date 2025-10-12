/**
 * Market Status API
 * Public endpoint for checking if the stock market is open/closed
 */

import { isDemoMode } from '@/lib/demo-mode'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:42069'

export interface MarketStatusResponse {
  is_open: boolean
  current_time: string
  next_event: 'open' | 'close'
  next_event_time: string
}

/**
 * Get current market status (open/closed) and next market event
 * This is a public endpoint - no authentication required
 */
export const getMarketStatus = async (): Promise<MarketStatusResponse> => {
  // Demo mode: return mock market status
  if (isDemoMode()) {
    const now = new Date()
    const hour = now.getHours()
    const isOpen = hour >= 9 && hour < 16 // Mock: open 9am-4pm
    
    // Calculate next event time
    const nextEventDate = new Date(now)
    if (isOpen) {
      // Market is open, next event is close at 4pm
      nextEventDate.setHours(16, 0, 0, 0)
    } else if (hour < 9) {
      // Before market open today
      nextEventDate.setHours(9, 30, 0, 0)
    } else {
      // After market close, next open is tomorrow 9:30am
      nextEventDate.setDate(nextEventDate.getDate() + 1)
      nextEventDate.setHours(9, 30, 0, 0)
    }
    
    return {
      is_open: isOpen,
      current_time: now.toISOString(),
      next_event: isOpen ? 'close' : 'open',
      next_event_time: nextEventDate.toISOString(),
    }
  }
  
  const url = `${API_BASE_URL}/api/market/status/`
  
  try {
    console.log('Fetching market status from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout and better error handling
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Market status API error:', response.status, errorText)
      throw new Error(`Failed to fetch market status: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('Market status response:', data)
    return data
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching market status:', error.message)
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        console.error('Network error - is the backend server running at', API_BASE_URL, '?')
      }
    } else {
      console.error('Unknown error fetching market status:', error)
    }
    throw error
  }
}

