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
  purchase_price: number | null
  purchase_date: string | null
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

export interface PortfolioHolding {
  ticker: string
  company_name: string
  quantity: number
  purchase_price: number
  purchase_date: string | null
  current_price: number
  current_value: number
  cost_basis: number
  gain_loss: number
  gain_loss_percent: number
  alignment_score: number
  match_type: 'same_sign' | 'positive' | 'neutral' | 'negative'
  zodiac_sign: string
  element: string
}

export interface PortfolioSummary {
  cash_balance: number
  stocks_value: number
  total_portfolio_value: number
  total_cost_basis: number
  total_gain_loss: number
  total_gain_loss_percent: number
  overall_alignment_score: number
  cosmic_vibe_index: number
  element_distribution: { Fire: number; Earth: number; Air: number; Water: number }
  alignment_breakdown: { same_sign: number; positive: number; neutral: number; negative: number }
  holdings: PortfolioHolding[]
}

export interface PortfolioHistoryPoint {
  timestamp: string
  portfolio_value: number
  cash_balance: number
  stocks_value: number
  cosmic_vibe_index: number
}

export interface PortfolioHistoryResponse {
  timeframe: string
  data: PortfolioHistoryPoint[]
}

export interface StockHistoryPoint {
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface StockHistoryResponse {
  ticker: string
  timeframe: string
  data: StockHistoryPoint[]
}

interface PortfolioCacheData {
  data: PortfolioSummary
  timestamp: string
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
        balance: parseFloat(profile.starting_balance) || 100000,
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
        balance: parseFloat(profile.starting_balance) || 100000,
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
          purchase_price: trade.total_value / trade.quantity,
          purchase_date: new Date().toISOString(),
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

/**
 * Get portfolio summary with alignment metrics
 */
export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  const CACHE_KEY = 'zenTraderPortfolioCache'
  const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
  
  // Helper to get cached data
  const getCachedData = (): PortfolioSummary | null => {
    if (typeof window === 'undefined') return null
    
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null
      
      const cacheData: PortfolioCacheData = JSON.parse(cached)
      return cacheData.data
    } catch (error) {
      console.error('Failed to parse cached portfolio data:', error)
      return null
    }
  }
  
  // Helper to check if cache is fresh
  const isCacheFresh = (): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return false
      
      const cacheData: PortfolioCacheData = JSON.parse(cached)
      const cacheAge = Date.now() - new Date(cacheData.timestamp).getTime()
      return cacheAge < CACHE_DURATION
    } catch (error) {
      return false
    }
  }
  
  // Helper to save to cache
  const saveToCache = (data: PortfolioSummary) => {
    if (typeof window === 'undefined') return
    
    try {
      const cacheData: PortfolioCacheData = {
        data,
        timestamp: new Date().toISOString()
      }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Failed to cache portfolio data:', error)
    }
  }
  
  // Check if in demo mode
  if (isDemoMode()) {
    // For demo mode, calculate portfolio from holdings and stock data
    const demoHoldings = localStorage.getItem('zenTraderDemoHoldings')
    const demoProfile = localStorage.getItem('zenTraderDemoProfile')
    
    if (!demoProfile) {
      throw new Error('Demo profile not found')
    }
    
    const profile = JSON.parse(demoProfile)
    const holdings: UserHoldings = demoHoldings 
      ? JSON.parse(demoHoldings) 
      : { 
          id: 1, 
          balance: parseFloat(profile.starting_balance) || 100000, 
          positions: [], 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        }
    
    // Calculate portfolio summary for demo mode
    // For simplicity, we'll create a basic summary
    // In a real implementation, you'd fetch stock prices and calculate alignment
    const portfolioHoldings: PortfolioHolding[] = holdings.positions.map((pos) => ({
      ticker: pos.ticker,
      company_name: pos.ticker, // Would need to fetch from stocks API
      quantity: pos.quantity,
      purchase_price: pos.purchase_price || 0,
      purchase_date: pos.purchase_date,
      current_price: pos.purchase_price || 0, // Demo: use purchase price as current
      current_value: pos.total_value,
      cost_basis: pos.total_value,
      gain_loss: 0,
      gain_loss_percent: 0,
      alignment_score: 75, // Demo: default alignment
      match_type: 'neutral' as const,
      zodiac_sign: 'Aries', // Demo: would need to fetch
      element: 'Fire'
    }))
    
    const totalStocksValue = holdings.positions.reduce((sum, pos) => sum + pos.total_value, 0)
    
    return {
      cash_balance: holdings.balance,
      stocks_value: totalStocksValue,
      total_portfolio_value: holdings.balance + totalStocksValue,
      total_cost_basis: totalStocksValue,
      total_gain_loss: 0,
      total_gain_loss_percent: 0,
      overall_alignment_score: 75,
      cosmic_vibe_index: 78,
      element_distribution: { Fire: 25, Earth: 25, Air: 25, Water: 25 },
      alignment_breakdown: { same_sign: 0, positive: 0, neutral: holdings.positions.length, negative: 0 },
      holdings: portfolioHoldings
    }
  }
  
  // Try to fetch from API
  const url = `${API_BASE_URL}/portfolio/`
  console.log('Fetching portfolio summary from:', url)
  
  try {
    const response = await authenticatedFetch(url, {
      method: 'GET',
    })
    
    console.log('Portfolio response:', response.status)

    if (!response.ok) {
      let error
      try {
        error = await response.json()
        console.log('Portfolio error response:', error)
      } catch (parseError) {
        console.error('Failed to parse error response:', parseError)
        error = { detail: `Server error (${response.status})` }
      }
      
      // If we have an error, try to use cached data
      const cachedData = getCachedData()
      if (cachedData) {
        console.log('Using cached portfolio data due to error')
        return cachedData
      }
      
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in first.')
      }
      
      if (response.status === 404) {
        throw new Error('Portfolio not found. Please complete onboarding first.')
      }
      
      throw new Error(error.detail || error.message || 'Failed to fetch portfolio summary')
    }

    const result: PortfolioSummary = await response.json()
    console.log('Portfolio summary:', result)
    
    // Save to cache
    saveToCache(result)
    
    return result
  } catch (error) {
    console.error('Failed to fetch portfolio:', error)
    
    // Try to use cached data on network error
    const cachedData = getCachedData()
    if (cachedData) {
      console.log('Using cached portfolio data due to network error')
      return cachedData
    }
    
    // Re-throw if no cache available
    throw error
  }
}

/**
 * Get portfolio value history over time
 */
export const getPortfolioHistory = async (timeframe: string = '1M'): Promise<PortfolioHistoryResponse> => {
  // Check if in demo mode
  if (isDemoMode()) {
    // Generate mock data for demo mode
    const mockData = generateMockPortfolioHistory(timeframe)
    return {
      timeframe,
      data: mockData
    }
  }
  
  const url = `${API_BASE_URL}/portfolio/history/?timeframe=${timeframe}`
  console.log('Fetching portfolio history from:', url)
  
  const response = await authenticatedFetch(url, {
    method: 'GET',
  })
  
  console.log('Portfolio history response:', response.status)

  if (!response.ok) {
    let error
    try {
      error = await response.json()
      console.log('Portfolio history error response:', error)
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError)
      error = { detail: `Server error (${response.status})` }
    }
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in first.')
    }
    
    if (response.status === 404) {
      throw new Error('Portfolio history not found.')
    }
    
    throw new Error(error.detail || error.message || 'Failed to fetch portfolio history')
  }

  const result: PortfolioHistoryResponse = await response.json()
  console.log('Portfolio history:', result)
  
  return result
}

/**
 * Get stock price history over time
 */
export const getStockHistory = async (ticker: string, timeframe: string = '1M'): Promise<StockHistoryResponse> => {
  // Check if in demo mode
  if (isDemoMode()) {
    // Generate mock data for demo mode
    const mockData = generateMockStockHistory(ticker, timeframe)
    return {
      ticker: ticker.toUpperCase(),
      timeframe,
      data: mockData
    }
  }
  
  const url = `${API_BASE_URL}/stocks/${ticker}/history/?timeframe=${timeframe}`
  console.log('Fetching stock history from:', url)
  
  const response = await fetch(url, {
    method: 'GET',
  })
  
  console.log('Stock history response:', response.status)

  if (!response.ok) {
    let error
    try {
      error = await response.json()
      console.log('Stock history error response:', error)
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError)
      error = { detail: `Server error (${response.status})` }
    }
    
    if (response.status === 404) {
      throw new Error(`No historical data found for ${ticker}`)
    }
    
    throw new Error(error.detail || error.message || 'Failed to fetch stock history')
  }

  const result: StockHistoryResponse = await response.json()
  console.log('Stock history:', result)
  
  return result
}

/**
 * Generate mock portfolio history for demo mode
 */
function generateMockPortfolioHistory(timeframe: string): PortfolioHistoryPoint[] {
  const points: PortfolioHistoryPoint[] = []
  const now = new Date()
  let numPoints = 30
  let intervalMs = 24 * 60 * 60 * 1000 // 1 day
  
  // Adjust number of points and interval based on timeframe
  switch (timeframe) {
    case '1D':
      numPoints = 78 // 6.5 hours of trading * 12 (5-min intervals)
      intervalMs = 5 * 60 * 1000 // 5 minutes
      break
    case '5D':
      numPoints = 65 // 5 days * 13 (15-min intervals per day)
      intervalMs = 15 * 60 * 1000 // 15 minutes
      break
    case '1W':
      numPoints = 65
      intervalMs = 30 * 60 * 1000 // 30 minutes
      break
    case '1M':
      numPoints = 30
      intervalMs = 24 * 60 * 60 * 1000 // 1 day
      break
    case '3M':
      numPoints = 90
      intervalMs = 24 * 60 * 60 * 1000 // 1 day
      break
    case '1Y':
      numPoints = 52
      intervalMs = 7 * 24 * 60 * 60 * 1000 // 1 week
      break
    case '5Y':
      numPoints = 60
      intervalMs = 30 * 24 * 60 * 60 * 1000 // 1 month
      break
  }
  
  let baseValue = 100000
  for (let i = numPoints; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMs)
    const variation = (Math.random() - 0.45) * 2000 // Slight upward bias
    baseValue += variation
    const portfolioValue = Math.max(baseValue, 80000)
    const stocksValue = portfolioValue * 0.6
    const cashBalance = portfolioValue * 0.4
    
    points.push({
      timestamp: timestamp.toISOString(),
      portfolio_value: portfolioValue,
      cash_balance: cashBalance,
      stocks_value: stocksValue,
      cosmic_vibe_index: Math.round(65 + Math.random() * 30)
    })
  }
  
  return points
}

/**
 * Generate mock stock history for demo mode
 */
function generateMockStockHistory(ticker: string, timeframe: string): StockHistoryPoint[] {
  const points: StockHistoryPoint[] = []
  const now = new Date()
  let numPoints = 30
  let intervalMs = 24 * 60 * 60 * 1000 // 1 day
  
  // Adjust number of points and interval based on timeframe
  switch (timeframe) {
    case '1D':
      numPoints = 78
      intervalMs = 5 * 60 * 1000
      break
    case '5D':
      numPoints = 65
      intervalMs = 15 * 60 * 1000
      break
    case '1W':
      numPoints = 65
      intervalMs = 30 * 60 * 1000
      break
    case '1M':
      numPoints = 30
      intervalMs = 24 * 60 * 60 * 1000
      break
    case '3M':
      numPoints = 90
      intervalMs = 24 * 60 * 60 * 1000
      break
    case '1Y':
      numPoints = 52
      intervalMs = 7 * 24 * 60 * 60 * 1000
      break
    case '5Y':
      numPoints = 60
      intervalMs = 30 * 24 * 60 * 60 * 1000
      break
  }
  
  let basePrice = 150
  for (let i = numPoints; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * intervalMs)
    const variation = (Math.random() - 0.5) * 5
    basePrice += variation
    const open = Math.max(basePrice + (Math.random() - 0.5) * 2, 100)
    const close = Math.max(basePrice + (Math.random() - 0.5) * 2, 100)
    const high = Math.max(open, close) + Math.random() * 3
    const low = Math.min(open, close) - Math.random() * 3
    
    points.push({
      timestamp: timestamp.toISOString(),
      open,
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 50000000) + 10000000
    })
  }
  
  return points
}

