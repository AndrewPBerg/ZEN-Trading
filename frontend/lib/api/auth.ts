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

// Debug logging for Docker environment
if (typeof window !== 'undefined') {
  console.log('Client-side API_BASE_URL:', API_BASE_URL);
  console.log('Environment:', process.env.NODE_ENV);
} else {
  console.log('Server-side API_BASE_URL:', API_BASE_URL);
}


// Types
export interface UserProfile {
  zodiac_sign: string
  zodiac_symbol: string
  zodiac_element: string
  date_of_birth: string
  investing_style: string
  onboarding_completed: boolean
  starting_balance: string
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
  profile?: UserProfile
}

interface AuthTokens {
  access: string
  refresh: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterData {
  email: string
  username: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
}

// Secure storage helpers
const TOKEN_KEY = 'zenTraderTokens'
const USER_KEY = 'zenTraderUser'

const getStoredTokens = (): AuthTokens | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(TOKEN_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
} 

const setStoredTokens = (tokens: AuthTokens): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens))
}

const clearStoredTokens = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const setStoredUser = (user: User): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

// API functions
export const login = async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
  const url = `${API_BASE_URL}/auth/token/`
  console.log('Logging in at URL:', url)
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })
  
  console.log('Login response status:', response.status)
  console.log('Login response headers:', Object.fromEntries(response.headers.entries()))

  if (!response.ok) {
    let error
    try {
      error = await response.json()
    } catch {
      error = { detail: 'Network error or server unavailable' }
    }
    throw new Error(error.detail || 'Login failed')
  }

  const tokens: AuthTokens = await response.json()
  
  // Get user data
  const userResponse = await fetch(`${API_BASE_URL}/users/me/`, {
    headers: {
      'Authorization': `Bearer ${tokens.access}`
    },
  })

  if (!userResponse.ok) {
    let error
    try {
      error = await userResponse.json()
    } catch {
      error = { detail: 'Failed to fetch user data' }
    }
    throw new Error(error.detail || 'Failed to fetch user data')
  }

  const user: User = await userResponse.json()
  
  // Store tokens and user data
  setStoredTokens(tokens)
  setStoredUser(user)
  
  return { user, tokens }
}

export const register = async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
  const url = `${API_BASE_URL}/register/`
  console.log('Registering user at URL:', url)
  console.log('API_BASE_URL:', API_BASE_URL)
  console.log('Full constructed URL:', url)
  console.log('Request data:', data)
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  
  console.log('Register response status:', response.status)
  console.log('Register response URL:', response.url)
  console.log('Register response headers:', Object.fromEntries(response.headers.entries()))

  if (!response.ok) {
    let error
    try {
      error = await response.json()
      console.log('Full error response:', error)
      
      // Django REST framework validation errors come in this format
      if (error && typeof error === 'object') {
        // If it's field validation errors, format them nicely
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
      error = { detail: `Server error (${response.status}): Network error or server unavailable` }
    }
    throw new Error(error.detail || error.message || 'Registration failed')
  }

  const user: User = await response.json()
  
  // Auto-login after registration
  const loginResponse = await fetch(`${API_BASE_URL}/auth/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: data.email,
      password: data.password
    }),
  })

  if (!loginResponse.ok) {
    let error
    try {
      error = await loginResponse.json()
    } catch {
      error = { detail: 'Registration successful but auto-login failed' }
    }
    throw new Error(error.detail || 'Registration successful but auto-login failed')
  }

  const tokens: AuthTokens = await loginResponse.json()
  
  // Store tokens and user data
  setStoredTokens(tokens)
  setStoredUser(user)
  
  return { user, tokens }
}

export const logout = (): void => {
  clearStoredTokens()
}

export const getCurrentUser = (): User | null => {
  return getStoredUser()
}

/**
 * Fetch the current user from the API and update localStorage
 * This ensures we have the latest user profile data
 */
export const fetchCurrentUser = async (): Promise<User | null> => {
  const tokens = getStoredTokens()
  if (!tokens?.access) {
    console.log('🔐 No access token, cannot fetch current user')
    return null
  }

  try {
    const url = `${API_BASE_URL}/users/me/`
    console.log('🔐 Fetching current user from:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokens.access}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('🔐 User fetch response status:', response.status)

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        console.log('🔐 Token expired, attempting refresh...')
        const newTokens = await refreshToken()
        if (newTokens) {
          // Retry with new token
          const retryResponse = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${newTokens.access}`,
              'Content-Type': 'application/json',
            },
          })
          
          if (retryResponse.ok) {
            const user: User = await retryResponse.json()
            setStoredUser(user)
            console.log('🔐 User fetched successfully after token refresh:', user)
            return user
          }
        }
        // Refresh failed, logout
        logout()
        return null
      }
      
      let error
      try {
        error = await response.json()
      } catch {
        error = { detail: 'Failed to fetch user data' }
      }
      console.error('🔐 Failed to fetch user:', error)
      return null
    }

    const user: User = await response.json()
    setStoredUser(user)
    console.log('🔐 User fetched successfully:', user)
    return user
  } catch (error) {
    console.error('🔐 Error fetching current user:', error)
    return null
  }
}

export const getCurrentTokens = (): AuthTokens | null => {
  return getStoredTokens()
}

export const isAuthenticated = (): boolean => {
  const tokens = getStoredTokens()
  return tokens !== null && tokens.access !== ''
}

// Hook for refreshing tokens
export const refreshToken = async (): Promise<AuthTokens | null> => {
  const tokens = getStoredTokens()
  if (!tokens?.refresh) return null

  try {
    const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: tokens.refresh }),
    })

    if (!response.ok) {
      let error
      try {
        error = await response.json()
      } catch {
        error = { detail: 'Token refresh failed' }
      }
      throw new Error(error.detail || 'Token refresh failed')
    }

    const newTokens: AuthTokens = await response.json()
    setStoredTokens(newTokens)
    return newTokens
  } catch {
    logout()
    return null
  }
}