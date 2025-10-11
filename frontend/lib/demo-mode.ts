// Demo Mode utilities for managing demo user state

const DEMO_MODE_KEY = 'zenTraderDemoMode'
const DEMO_USER_KEY = 'zenTraderDemoUser'
const DEMO_PROFILE_KEY = 'zenTraderDemoProfile'

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

