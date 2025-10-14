/**
 * Generic caching utility for localStorage with TTL (Time To Live)
 */

interface CachedData<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * Store data in cache with a TTL
 * @param key Cache key
 * @param data Data to cache
 * @param ttlSeconds Time to live in seconds (default: 300 = 5 minutes)
 */
export function setCache<T>(key: string, data: T, ttlSeconds: number = 300): void {
  if (typeof window === 'undefined') return
  
  const cached: CachedData<T> = {
    data,
    timestamp: Date.now(),
    ttl: ttlSeconds * 1000, // Convert to milliseconds
  }
  
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify(cached))
  } catch (error) {
    console.error(`Failed to cache data for key "${key}":`, error)
  }
}

/**
 * Get data from cache if it exists and hasn't expired
 * @param key Cache key
 * @returns Cached data or null if not found or expired
 */
export function getCache<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const cached = localStorage.getItem(`cache_${key}`)
    if (!cached) return null
    
    const parsedCache: CachedData<T> = JSON.parse(cached)
    const now = Date.now()
    const age = now - parsedCache.timestamp
    
    // Check if cache has expired
    if (age > parsedCache.ttl) {
      // Cache expired, remove it
      localStorage.removeItem(`cache_${key}`)
      return null
    }
    
    return parsedCache.data
  } catch (error) {
    console.error(`Failed to retrieve cache for key "${key}":`, error)
    return null
  }
}

/**
 * Clear a specific cache entry
 * @param key Cache key
 */
export function clearCache(key: string): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(`cache_${key}`)
  } catch (error) {
    console.error(`Failed to clear cache for key "${key}":`, error)
  }
}

/**
 * Clear all cache entries (useful for logout)
 */
export function clearAllCache(): void {
  if (typeof window === 'undefined') return
  
  try {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key)
      }
    })
  } catch (error) {
    console.error('Failed to clear all cache:', error)
  }
}

/**
 * Check if cache exists and is valid
 * @param key Cache key
 * @returns True if cache exists and hasn't expired
 */
export function isCacheValid(key: string): boolean {
  return getCache(key) !== null
}

