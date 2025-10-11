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
}

export interface UserProfile {
  date_of_birth: string | null
  zodiac_sign: string | null
  zodiac_symbol: string | null
  zodiac_element: string | null
  investing_style: string | null
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
 * Get the current user's onboarding status
 */
export const getOnboardingStatus = async (): Promise<OnboardingStatusResponse> => {
  const url = `${API_BASE_URL}/onboarding/`
  console.log('Fetching onboarding status from:', url)
  
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required. Please log in first.')
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
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
 * Requires user to be authenticated
 */
export const submitOnboarding = async (data: OnboardingData): Promise<OnboardingResponse> => {
  const url = `${API_BASE_URL}/onboarding/`
  console.log('Submitting onboarding data to:', url)
  
  const token = getAuthToken()
  if (!token) {
    throw new Error('Authentication required. Please log in first.')
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
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

