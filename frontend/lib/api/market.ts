/**
 * Market Status API
 * Public endpoint for checking if the stock market is open/closed
 */

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

