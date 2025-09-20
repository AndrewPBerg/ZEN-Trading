const API_BASE_URL = '/api'

// Types
interface User {
  id: number
  email: string
  username: string
  first_name: string
  last_name: string
  date_joined: string
  is_active: boolean
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
  const response = await fetch(`${API_BASE_URL}/auth/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Login failed')
  }

  const tokens: AuthTokens = await response.json()
  
  // Get user data
  const userResponse = await fetch(`${API_BASE_URL}/users/me/`, {
    headers: {
      'Authorization': `Bearer ${tokens.access}`,
    },
  })

  if (!userResponse.ok) {
    throw new Error('Failed to fetch user data')
  }

  const user: User = await userResponse.json()
  
  // Store tokens and user data
  setStoredTokens(tokens)
  setStoredUser(user)
  
  return { user, tokens }
}

export const register = async (data: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
  const response = await fetch(`${API_BASE_URL}/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Registration failed')
  }

  const user: User = await response.json()
  
  // Auto-login after registration
  const tokens = await login({ email: data.email, password: data.password })
  
  return { user, tokens: tokens.tokens }
}

export const logout = (): void => {
  clearStoredTokens()
}

export const getCurrentUser = (): User | null => {
  return getStoredUser()
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
      throw new Error('Token refresh failed')
    }

    const newTokens: AuthTokens = await response.json()
    setStoredTokens(newTokens)
    return newTokens
  } catch {
    logout()
    return null
  }
}