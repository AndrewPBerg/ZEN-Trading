import { isDemoMode } from '@/lib/demo-mode'
import { authenticatedFetch } from '@/lib/api/api-utils'

// API configuration for Docker environment
const getApiBaseUrl = () => {
  // For client-side requests (browser), use the exposed port
  if (typeof window !== 'undefined') {
    return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:42069') + '/api';
  }
  
  // For server-side requests, use internal Docker network
  return (process.env.INTERNAL_API_URL || 'http://localhost:42069') + '/api';
};

const API_BASE_URL = getApiBaseUrl();

// Types
export interface StockHolding {
  id: number
  ticker: string
  quantity: number
  total_value: number
  created_at: string
  updated_at: string
}

export interface UserHoldings {
  id: number
  balance: number
  positions: StockHolding[]
  created_at: string
  updated_at: string
}

export interface TradeRequest {
  ticker: string
  quantity: number
  total_value: number
  action: 'buy' | 'sell'
}

export interface TradeResponse {
  message: string
  holdings: UserHoldings
}

/**
 * Get the current user's holdings (balance and stock positions)
 */
export const getUserHoldings = async (): Promise<UserHoldings> => {
  // Check if in demo mode first
  if (isDemoMode()) {
    // Check for demo holdings first (updated by trades)
    const demoHoldings = localStorage.getItem('zenTraderDemoHoldings')
    if (demoHoldings) {
      return JSON.parse(demoHoldings)
    }
    
    // Otherwise create from profile
    const demoProfile = localStorage.getItem('zenTraderDemoProfile')
    if (demoProfile) {
      const profile = JSON.parse(demoProfile)
      return {
        id: 1,
        balance: profile.starting_balance || 100000,
        positions: [],
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString(),
      }
    }
    
    // Fallback demo data
    return {
      id: 1,
      balance: 100000,
      positions: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  
  const url = `${API_BASE_URL}/holdings/`
  console.log('Fetching user holdings from:', url)
  
  const response = await authenticatedFetch(url, {
    method: 'GET',
  })
  
  console.log('Holdings response:', response.status)

  if (!response.ok) {
    let error
    try {
      error = await response.json()
      console.log('Holdings error response:', error)
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError)
      error = { detail: `Server error (${response.status})` }
    }
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in first.')
    }
    
    if (response.status === 404) {
      throw new Error('Holdings not found. Please complete onboarding first.')
    }
    
    throw new Error(error.detail || error.message || 'Failed to fetch holdings')
  }

  const result: UserHoldings = await response.json()
  console.log('User holdings:', result)
  
  return result
}

/**
 * Execute a trade (buy or sell stocks)
 */
export const executeTrade = async (trade: TradeRequest): Promise<TradeResponse> => {
  // Check if in demo mode first
  if (isDemoMode()) {
    // Simulate trade in demo mode
    const demoProfile = localStorage.getItem('zenTraderDemoProfile')
    const demoHoldings = localStorage.getItem('zenTraderDemoHoldings')
    
    let holdings: UserHoldings
    
    if (demoHoldings) {
      holdings = JSON.parse(demoHoldings)
    } else if (demoProfile) {
      const profile = JSON.parse(demoProfile)
      holdings = {
        id: 1,
        balance: profile.starting_balance || 100000,
        positions: [],
        created_at: profile.created_at || new Date().toISOString(),
        updated_at: profile.updated_at || new Date().toISOString(),
      }
    } else {
      holdings = {
        id: 1,
        balance: 100000,
        positions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }
    
    // Process the trade in demo mode
    if (trade.action === 'buy') {
      if (holdings.balance < trade.total_value) {
        throw new Error(`Insufficient balance. You have $${holdings.balance.toLocaleString()} but need $${trade.total_value.toLocaleString()}`)
      }
      
      // Find existing position
      const existingPosition = holdings.positions.find(p => p.ticker === trade.ticker)
      
      if (existingPosition) {
        existingPosition.quantity += trade.quantity
        existingPosition.total_value += trade.total_value
        existingPosition.updated_at = new Date().toISOString()
      } else {
        holdings.positions.push({
          id: holdings.positions.length + 1,
          ticker: trade.ticker,
          quantity: trade.quantity,
          total_value: trade.total_value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      }
      
      holdings.balance -= trade.total_value
    } else if (trade.action === 'sell') {
      const existingPosition = holdings.positions.find(p => p.ticker === trade.ticker)
      
      if (!existingPosition) {
        throw new Error(`You do not own any shares of ${trade.ticker}`)
      }
      
      if (existingPosition.quantity < trade.quantity) {
        throw new Error(`You only own ${existingPosition.quantity} shares of ${trade.ticker}`)
      }
      
      existingPosition.quantity -= trade.quantity
      existingPosition.total_value -= trade.total_value
      existingPosition.updated_at = new Date().toISOString()
      
      if (existingPosition.quantity <= 0) {
        holdings.positions = holdings.positions.filter(p => p.ticker !== trade.ticker)
      }
      
      holdings.balance += trade.total_value
    }
    
    holdings.updated_at = new Date().toISOString()
    
    // Save to localStorage
    localStorage.setItem('zenTraderDemoHoldings', JSON.stringify(holdings))
    
    return {
      message: `Successfully ${trade.action === 'buy' ? 'purchased' : 'sold'} ${trade.quantity} shares of ${trade.ticker}`,
      holdings,
    }
  }
  
  // Authenticated mode: Call backend API
  const url = `${API_BASE_URL}/holdings/`
  console.log('Executing trade:', trade, 'to:', url)
  
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(trade),
  })
  
  console.log('Trade response:', response.status)

  if (!response.ok) {
    let error
    try {
      error = await response.json()
      console.log('Trade error response:', error)
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError)
      error = { detail: `Server error (${response.status})` }
    }
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in first.')
    }
    
    if (response.status === 400) {
      throw new Error(error.detail || error.error || 'Invalid trade request')
    }
    
    if (response.status === 404) {
      throw new Error(error.detail || 'Holdings or position not found')
    }
    
    throw new Error(error.detail || error.message || 'Failed to execute trade')
  }

  const result: TradeResponse = await response.json()
  console.log('Trade successful:', result)
  
  return result
}

