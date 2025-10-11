import { isDemoMode } from '@/lib/demo-mode'
import { getCache, setCache } from '@/lib/cache'

// API configuration
const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:42069') + '/api'
  }
  return (process.env.INTERNAL_API_URL || 'http://localhost:42069') + '/api'
}

const API_BASE_URL = getApiBaseUrl()

// Types
export interface Stock {
  id: number
  ticker: string
  company_name: string
  current_price: number | null
  previous_close: number | null
  market_state: string | null
  last_updated: string
  description: string
  date_founded: string | null
  zodiac_sign: string | null
  match_type?: string
  compatibility_score?: number
  is_same_sign?: boolean
  element?: string
}

export interface ZodiacMatchedStocksResponse {
  user_sign: string
  user_element: string
  total_matches: number
  matched_stocks: Stock[]
}

export interface StockPreference {
  id: number
  ticker: string
  preference_type: 'watchlist' | 'dislike'
  created_at: string
}

// Helper to get auth token
const getAuthToken = (): string | null => {
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
 * Get zodiac matched stocks for the authenticated user
 * Uses 5-minute caching to minimize API calls
 */
export const getZodiacMatchedStocks = async (forceRefresh: boolean = false): Promise<ZodiacMatchedStocksResponse> => {
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = getCache<ZodiacMatchedStocksResponse>('zodiac_matched_stocks')
    if (cached) {
      console.log('Using cached zodiac matched stocks')
      return cached
    }
  }

  // Check if in demo mode
  if (isDemoMode()) {
    // Return demo data
    const demoData: ZodiacMatchedStocksResponse = {
      user_sign: 'Virgo',
      user_element: 'Earth',
      total_matches: 6,
      matched_stocks: [
        {
          id: 1,
          ticker: 'AAPL',
          company_name: 'Apple Inc.',
          current_price: 189.25,
          previous_close: 186.8,
          market_state: 'REGULAR',
          last_updated: new Date().toISOString(),
          description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
          date_founded: '1976-04-01T00:00:00Z',
          zodiac_sign: 'Virgo',
          match_type: 'positive',
          compatibility_score: 4,
          is_same_sign: true,
          element: 'Earth',
        },
        {
          id: 2,
          ticker: 'MSFT',
          company_name: 'Microsoft Corporation',
          current_price: 378.85,
          previous_close: 380.05,
          market_state: 'REGULAR',
          last_updated: new Date().toISOString(),
          description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide.',
          date_founded: '1975-04-04T00:00:00Z',
          zodiac_sign: 'Taurus',
          match_type: 'positive',
          compatibility_score: 3,
          is_same_sign: false,
          element: 'Earth',
        },
        {
          id: 3,
          ticker: 'GOOGL',
          company_name: 'Alphabet Inc.',
          current_price: 142.56,
          previous_close: 138.78,
          market_state: 'REGULAR',
          last_updated: new Date().toISOString(),
          description: 'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
          date_founded: '1998-09-04T00:00:00Z',
          zodiac_sign: 'Virgo',
          match_type: 'positive',
          compatibility_score: 4,
          is_same_sign: true,
          element: 'Earth',
        },
        {
          id: 4,
          ticker: 'NVDA',
          company_name: 'NVIDIA Corporation',
          current_price: 875.3,
          previous_close: 859.7,
          market_state: 'REGULAR',
          last_updated: new Date().toISOString(),
          description: 'NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally.',
          date_founded: '1993-01-01T00:00:00Z',
          zodiac_sign: 'Capricorn',
          match_type: 'positive',
          compatibility_score: 3,
          is_same_sign: false,
          element: 'Earth',
        },
        {
          id: 5,
          ticker: 'TSLA',
          company_name: 'Tesla, Inc.',
          current_price: 248.42,
          previous_close: 252.75,
          market_state: 'REGULAR',
          last_updated: new Date().toISOString(),
          description: 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.',
          date_founded: '2003-07-01T00:00:00Z',
          zodiac_sign: 'Cancer',
          match_type: 'neutral',
          compatibility_score: 2,
          is_same_sign: false,
          element: 'Water',
        },
        {
          id: 6,
          ticker: 'META',
          company_name: 'Meta Platforms, Inc.',
          current_price: 484.2,
          previous_close: 475.3,
          market_state: 'REGULAR',
          last_updated: new Date().toISOString(),
          description: 'Meta Platforms, Inc. engages in the development of products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide.',
          date_founded: '2004-02-04T00:00:00Z',
          zodiac_sign: 'Aquarius',
          match_type: 'neutral',
          compatibility_score: 2,
          is_same_sign: false,
          element: 'Air',
        },
      ],
    }
    
    // Cache demo data
    setCache('zodiac_matched_stocks', demoData, 300) // 5 minutes
    return demoData
  }

  const url = `${API_BASE_URL}/zodiac/matched-stocks/`
  console.log('Fetching zodiac matched stocks from:', url)

  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required. Please log in first.')
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  console.log('Zodiac matched stocks response:', response.status)

  if (!response.ok) {
    let error
    try {
      error = await response.json()
      console.log('Zodiac matched stocks error response:', error)
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError)
      error = { detail: `Server error (${response.status})` }
    }

    if (response.status === 401) {
      throw new Error('Authentication required. Please log in first.')
    }

    throw new Error(error.detail || error.error || 'Failed to fetch zodiac matched stocks')
  }

  const result: ZodiacMatchedStocksResponse = await response.json()
  console.log('Zodiac matched stocks:', result)

  // Cache the result for 5 minutes
  setCache('zodiac_matched_stocks', result, 300)

  return result
}

/**
 * Get user's watchlist
 */
export const getWatchlist = async (): Promise<StockPreference[]> => {
  if (isDemoMode()) {
    const watchlist = localStorage.getItem('zenTraderDemoWatchlist')
    return watchlist ? JSON.parse(watchlist) : []
  }

  const url = `${API_BASE_URL}/watchlist/`
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required. Please log in first.')
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch watchlist' }))
    throw new Error(error.detail || 'Failed to fetch watchlist')
  }

  const result = await response.json()
  return result.watchlist || []
}

/**
 * Add a stock to the watchlist
 */
export const addToWatchlist = async (ticker: string): Promise<{ message: string; preference: StockPreference }> => {
  if (isDemoMode()) {
    const watchlist = localStorage.getItem('zenTraderDemoWatchlist')
    const list: StockPreference[] = watchlist ? JSON.parse(watchlist) : []
    
    // Check if already in watchlist
    const existing = list.find(p => p.ticker === ticker)
    if (existing) {
      return { message: 'Already in watchlist', preference: existing }
    }
    
    const newPref: StockPreference = {
      id: list.length + 1,
      ticker,
      preference_type: 'watchlist',
      created_at: new Date().toISOString(),
    }
    
    list.push(newPref)
    localStorage.setItem('zenTraderDemoWatchlist', JSON.stringify(list))
    
    return { message: 'Added to watchlist', preference: newPref }
  }

  const url = `${API_BASE_URL}/watchlist/`
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required. Please log in first.')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ticker }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to add to watchlist' }))
    throw new Error(error.detail || error.error || 'Failed to add to watchlist')
  }

  return await response.json()
}

/**
 * Remove a stock from the watchlist
 */
export const removeFromWatchlist = async (ticker: string): Promise<{ message: string }> => {
  if (isDemoMode()) {
    const watchlist = localStorage.getItem('zenTraderDemoWatchlist')
    const list: StockPreference[] = watchlist ? JSON.parse(watchlist) : []
    const filtered = list.filter(p => p.ticker !== ticker)
    localStorage.setItem('zenTraderDemoWatchlist', JSON.stringify(filtered))
    return { message: `Removed ${ticker} from watchlist` }
  }

  const url = `${API_BASE_URL}/watchlist/`
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required. Please log in first.')
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ticker }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to remove from watchlist' }))
    throw new Error(error.detail || error.error || 'Failed to remove from watchlist')
  }

  return await response.json()
}

/**
 * Get user's dislike list
 */
export const getDislikeList = async (): Promise<StockPreference[]> => {
  if (isDemoMode()) {
    const dislikeList = localStorage.getItem('zenTraderDemoDislikeList')
    return dislikeList ? JSON.parse(dislikeList) : []
  }

  const url = `${API_BASE_URL}/dislike-list/`
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required. Please log in first.')
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch dislike list' }))
    throw new Error(error.detail || 'Failed to fetch dislike list')
  }

  const result = await response.json()
  return result.dislike_list || []
}

/**
 * Add a stock to the dislike list
 */
export const addToDislikeList = async (ticker: string): Promise<{ message: string; preference: StockPreference }> => {
  if (isDemoMode()) {
    const dislikeList = localStorage.getItem('zenTraderDemoDislikeList')
    const list: StockPreference[] = dislikeList ? JSON.parse(dislikeList) : []
    
    // Check if already in dislike list
    const existing = list.find(p => p.ticker === ticker)
    if (existing) {
      return { message: 'Already in dislike list', preference: existing }
    }
    
    const newPref: StockPreference = {
      id: list.length + 1,
      ticker,
      preference_type: 'dislike',
      created_at: new Date().toISOString(),
    }
    
    list.push(newPref)
    localStorage.setItem('zenTraderDemoDislikeList', JSON.stringify(list))
    
    return { message: 'Added to dislike list', preference: newPref }
  }

  const url = `${API_BASE_URL}/dislike-list/`
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required. Please log in first.')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ticker }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to add to dislike list' }))
    throw new Error(error.detail || error.error || 'Failed to add to dislike list')
  }

  return await response.json()
}

/**
 * Remove a stock from the dislike list
 */
export const removeFromDislikeList = async (ticker: string): Promise<{ message: string }> => {
  if (isDemoMode()) {
    const dislikeList = localStorage.getItem('zenTraderDemoDislikeList')
    const list: StockPreference[] = dislikeList ? JSON.parse(dislikeList) : []
    const filtered = list.filter(p => p.ticker !== ticker)
    localStorage.setItem('zenTraderDemoDislikeList', JSON.stringify(filtered))
    return { message: `Removed ${ticker} from dislike list` }
  }

  const url = `${API_BASE_URL}/dislike-list/`
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required. Please log in first.')
  }

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ticker }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to remove from dislike list' }))
    throw new Error(error.detail || error.error || 'Failed to remove from dislike list')
  }

  return await response.json()
}

