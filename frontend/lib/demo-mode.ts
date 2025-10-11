// Demo Mode utilities for managing demo user state

const DEMO_MODE_KEY = 'zenTraderDemoMode'
const DEMO_USER_KEY = 'zenTraderDemoUser'
const DEMO_PROFILE_KEY = 'zenTraderDemoProfile'
const DEMO_HOLDINGS_KEY = 'zenTraderDemoHoldings'
const DEMO_WATCHLIST_KEY = 'zenTraderDemoWatchlist'
const DEMO_DISLIKE_LIST_KEY = 'zenTraderDemoDislikeList'

export interface DemoUser {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  date_joined: string
  is_active: boolean
}

export interface DemoProfile {
  date_of_birth: string
  zodiac_sign: string
  zodiac_symbol: string
  zodiac_element: string
  investing_style: string
  starting_balance: number
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

/**
 * Enable or disable demo mode
 */
export const setDemoMode = (enabled: boolean): void => {
  if (typeof window === 'undefined') return
  
  if (enabled) {
    localStorage.setItem(DEMO_MODE_KEY, 'true')
  } else {
    localStorage.removeItem(DEMO_MODE_KEY)
    localStorage.removeItem(DEMO_USER_KEY)
    localStorage.removeItem(DEMO_PROFILE_KEY)
    localStorage.removeItem(DEMO_HOLDINGS_KEY)
    localStorage.removeItem(DEMO_WATCHLIST_KEY)
    localStorage.removeItem(DEMO_DISLIKE_LIST_KEY)
  }
}

/**
 * Check if currently in demo mode
 */
export const isDemoMode = (): boolean => {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(DEMO_MODE_KEY) === 'true'
}

/**
 * Get demo user data
 */
export const getDemoUser = (): DemoUser | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(DEMO_USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

/**
 * Set demo user data
 */
export const setDemoUser = (user: DemoUser): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEMO_USER_KEY, JSON.stringify(user))
}

/**
 * Get demo user profile
 */
export const getDemoProfile = (): DemoProfile | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(DEMO_PROFILE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

/**
 * Set demo user profile
 */
export const setDemoUserProfile = (profile: Partial<DemoProfile>): void => {
  if (typeof window === 'undefined') return
  
  const now = new Date().toISOString()
  const existingProfile = getDemoProfile()
  
  const fullProfile: DemoProfile = {
    date_of_birth: profile.date_of_birth || '',
    zodiac_sign: profile.zodiac_sign || '',
    zodiac_symbol: profile.zodiac_symbol || '',
    zodiac_element: profile.zodiac_element || '',
    investing_style: profile.investing_style || '',
    starting_balance: profile.starting_balance || 100000,
    onboarding_completed: profile.onboarding_completed ?? true,
    created_at: existingProfile?.created_at || now,
    updated_at: now,
  }
  
  localStorage.setItem(DEMO_PROFILE_KEY, JSON.stringify(fullProfile))
}

/**
 * Create a demo user with profile
 */
export const createDemoUser = (profileData: Partial<DemoProfile>): { user: DemoUser; profile: DemoProfile } => {
  const now = new Date().toISOString()
  
  const demoUser: DemoUser = {
    id: 999999,
    email: 'demo@zentraders.com',
    username: 'DemoUser',
    first_name: 'Demo',
    last_name: 'User',
    date_joined: now,
    is_active: true,
  }
  
  const demoProfile: DemoProfile = {
    date_of_birth: profileData.date_of_birth || '',
    zodiac_sign: profileData.zodiac_sign || '',
    zodiac_symbol: profileData.zodiac_symbol || '',
    zodiac_element: profileData.zodiac_element || '',
    investing_style: profileData.investing_style || '',
    starting_balance: profileData.starting_balance || 100000,
    onboarding_completed: true,
    created_at: now,
    updated_at: now,
  }
  
  setDemoUser(demoUser)
  setDemoUserProfile(demoProfile)
  
  return { user: demoUser, profile: demoProfile }
}

/**
 * Clear all demo mode data
 */
export const clearDemoMode = (): void => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(DEMO_MODE_KEY)
  localStorage.removeItem(DEMO_USER_KEY)
  localStorage.removeItem(DEMO_PROFILE_KEY)
  localStorage.removeItem(DEMO_HOLDINGS_KEY)
  localStorage.removeItem(DEMO_WATCHLIST_KEY)
  localStorage.removeItem(DEMO_DISLIKE_LIST_KEY)
}

/**
 * Get complete demo user with profile
 */
export const getCompleteDemoUser = (): (DemoUser & { profile: DemoProfile }) | null => {
  const user = getDemoUser()
  const profile = getDemoProfile()
  
  if (!user || !profile) return null
  
  return {
    ...user,
    profile,
  }
}

/**
 * Get demo watchlist
 */
export const getDemoWatchlist = (): string[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(DEMO_WATCHLIST_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Set demo watchlist
 */
export const setDemoWatchlist = (tickers: string[]): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEMO_WATCHLIST_KEY, JSON.stringify(tickers))
}

/**
 * Add ticker to demo watchlist
 */
export const addToDemoWatchlist = (ticker: string): void => {
  const watchlist = getDemoWatchlist()
  if (!watchlist.includes(ticker)) {
    watchlist.push(ticker)
    setDemoWatchlist(watchlist)
  }
}

/**
 * Remove ticker from demo watchlist
 */
export const removeFromDemoWatchlist = (ticker: string): void => {
  const watchlist = getDemoWatchlist()
  const filtered = watchlist.filter(t => t !== ticker)
  setDemoWatchlist(filtered)
}

/**
 * Get demo dislike list
 */
export const getDemoDislikeList = (): string[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(DEMO_DISLIKE_LIST_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Set demo dislike list
 */
export const setDemoDislikeList = (tickers: string[]): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEMO_DISLIKE_LIST_KEY, JSON.stringify(tickers))
}

/**
 * Add ticker to demo dislike list
 */
export const addToDemoDislikeList = (ticker: string): void => {
  const dislikeList = getDemoDislikeList()
  if (!dislikeList.includes(ticker)) {
    dislikeList.push(ticker)
    setDemoDislikeList(dislikeList)
  }
}

/**
 * Remove ticker from demo dislike list
 */
export const removeFromDemoDislikeList = (ticker: string): void => {
  const dislikeList = getDemoDislikeList()
  const filtered = dislikeList.filter(t => t !== ticker)
  setDemoDislikeList(filtered)
}

