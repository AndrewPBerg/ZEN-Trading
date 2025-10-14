import { isDemoMode, setDemoUserProfile, getDemoUser, getDemoProfile } from '@/lib/demo-mode'
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
export interface OnboardingData {
  date_of_birth: string
  zodiac_sign: string
  zodiac_symbol?: string
  zodiac_element?: string
  investing_style: string
  starting_balance: number
}

export interface UserProfile {
  date_of_birth: string | null
  zodiac_sign: string | null
  zodiac_symbol: string | null
  zodiac_element: string | null
  investing_style: string | null
  starting_balance: number | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  date_joined: string
  is_active: boolean
  profile: UserProfile
}

export interface OnboardingResponse {
  message: string
  user: User
}

export interface OnboardingStatusResponse {
  onboarding_completed: boolean
  user: User
}

/**
 * Get the current user's onboarding status
 */
export const getOnboardingStatus = async (): Promise<OnboardingStatusResponse> => {
  // Check if in demo mode first
  if (isDemoMode()) {
    const demoUser = getDemoUser()
    const demoProfile = getDemoProfile()
    
    if (!demoUser || !demoProfile) {
      throw new Error('Demo mode data not found')
    }
    
    return {
      onboarding_completed: demoProfile.onboarding_completed,
      user: {
        ...demoUser,
        profile: demoProfile,
      },
    }
  }
  
  const url = `${API_BASE_URL}/onboarding/`
  console.log('Fetching onboarding status from:', url)
  
  const response = await authenticatedFetch(url, {
    method: 'GET',
  })
  
  console.log('Onboarding status response:', response.status)

  if (!response.ok) {
    let error
    try {
      error = await response.json()
      console.log('Onboarding status error response:', error)
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError)
      error = { detail: `Server error (${response.status})` }
    }
    
    if (response.status === 401) {
      throw new Error('Authentication required. Please log in first.')
    }
    
    throw new Error(error.detail || error.message || 'Failed to fetch onboarding status')
  }

  const result: OnboardingStatusResponse = await response.json()
  console.log('Onboarding status:', result)
  
  return result
}

/**
 * Submit onboarding data to the backend
 * Requires user to be authenticated (or demo mode)
 */
export const submitOnboarding = async (data: OnboardingData): Promise<OnboardingResponse> => {
  // Check if in demo mode first
  if (isDemoMode()) {
    return submitOnboardingDemo(data)
  }
  
  const url = `${API_BASE_URL}/onboarding/`
  console.log('Submitting onboarding data to:', url)
  
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
  })
  
  console.log('Onboarding response status:', response.status)

  if (!response.ok) {
    let error
    try {
      error = await response.json()
      console.log('Onboarding error response:', error)
      
      // Handle authentication errors
      if (response.status === 401) {
        throw new Error('Authentication required. Please log in first.')
      }
      
      // Handle field validation errors
      if (error && typeof error === 'object') {
        const fieldErrors = Object.entries(error).map(([field, messages]) => {
          if (Array.isArray(messages)) {
            return `${field}: ${messages.join(', ')}`
          }
          return `${field}: ${messages}`
        }).join(' | ')
        
        throw new Error(fieldErrors || JSON.stringify(error))
      }
    } catch (parseError) {
      console.error('Failed to parse error response:', parseError)
      if (parseError instanceof Error && parseError.message) {
        throw parseError
      }
      error = { detail: `Server error (${response.status})` }
    }
    throw new Error(error.detail || error.message || 'Failed to submit onboarding data')
  }

  const result: OnboardingResponse = await response.json()
  console.log('Onboarding successful:', result)
  
  return result
}

/**
 * Submit onboarding data in demo mode (no API call)
 */
export const submitOnboardingDemo = async (data: OnboardingData): Promise<OnboardingResponse> => {
  console.log('Submitting onboarding data in demo mode:', data)
  
  const demoUser = getDemoUser()
  if (!demoUser) {
    throw new Error('Demo user not found')
  }
  
  // Store profile data in localStorage
  setDemoUserProfile({
    date_of_birth: data.date_of_birth,
    zodiac_sign: data.zodiac_sign,
    zodiac_symbol: data.zodiac_symbol || '',
    zodiac_element: data.zodiac_element || '',
    investing_style: data.investing_style,
    onboarding_completed: true,
  })
  
  const profile = getDemoProfile()
  if (!profile) {
    throw new Error('Failed to create demo profile')
  }
  
  // Return mock response matching OnboardingResponse format
  return {
    message: 'Demo onboarding completed successfully',
    user: {
      ...demoUser,
      profile,
    },
  }
}

