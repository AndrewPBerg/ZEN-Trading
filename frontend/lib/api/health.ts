/**
 * API Health Check Utility
 * Checks if the backend API is available and responsive
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:42069'

// Cache health check result for 30 seconds to avoid repeated checks
let healthCheckCache: { isHealthy: boolean; timestamp: number } | null = null
const CACHE_DURATION = 30 * 1000 // 30 seconds

export interface HealthCheckResult {
  isHealthy: boolean
  error?: string
}

/**
 * Check if the backend API is available and responsive
 * Uses cached result if available and not expired
 */
export const checkApiHealth = async (): Promise<HealthCheckResult> => {
  // Return cached result if available and not expired
  if (healthCheckCache && Date.now() - healthCheckCache.timestamp < CACHE_DURATION) {
    return { isHealthy: healthCheckCache.isHealthy }
  }

  try {
    const url = `${API_BASE_URL}/health/`
    console.log('Checking API health at:', url)
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Short timeout for health checks
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    const isHealthy = response.ok
    const error = isHealthy ? undefined : `API returned ${response.status} ${response.statusText}`
    
    // Cache the result
    healthCheckCache = {
      isHealthy,
      timestamp: Date.now()
    }

    console.log('API health check result:', { isHealthy, error })
    return { isHealthy, error }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('API health check failed:', errorMessage)
    
    // Cache the failure result
    healthCheckCache = {
      isHealthy: false,
      timestamp: Date.now()
    }

    return { 
      isHealthy: false, 
      error: errorMessage 
    }
  }
}

/**
 * Clear the health check cache
 * Useful for forcing a fresh check
 */
export const clearHealthCheckCache = (): void => {
  healthCheckCache = null
}
