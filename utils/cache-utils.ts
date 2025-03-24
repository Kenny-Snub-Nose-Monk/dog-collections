// Cache expiration time in milliseconds (24 hours)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000

// Cache keys
export const CACHE_KEYS = {
  BREEDS_LIST: "dog-breeds-list",
  BREED_IMAGES: (breed: string) => `dog-images-${breed}`,
}

interface CacheItem<T> {
  data: T
  timestamp: number
}

export function getFromCache<T>(key: string): T | null {
  try {
    const cachedData = localStorage.getItem(key)
    if (!cachedData) return null

    const parsedData: CacheItem<T> = JSON.parse(cachedData)
    const now = Date.now()

    // Check if cache is expired
    if (now - parsedData.timestamp > CACHE_EXPIRATION) {
      localStorage.removeItem(key)
      return null
    }

    return parsedData.data
  } catch (error) {
    console.error("Error retrieving from cache:", error)
    return null
  }
}

export function saveToCache<T>(key: string, data: T): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
    }

    localStorage.setItem(key, JSON.stringify(cacheItem))
  } catch (error) {
    console.error("Error saving to cache:", error)
  }
}

