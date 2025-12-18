const CACHE_PREFIX = 'fitforge_cache_'
const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

export const cache = {
  set: (key, data, ttl = DEFAULT_TTL) => {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl
      }
      sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item))
    } catch (e) {
      console.warn('Cache set failed:', e)
    }
  },

  get: (key) => {
    try {
      const item = sessionStorage.getItem(CACHE_PREFIX + key)
      if (!item) return null

      const { data, timestamp, ttl } = JSON.parse(item)
      
      if (Date.now() - timestamp > ttl) {
        cache.remove(key)
        return null
      }

      return data
    } catch (e) {
      console.warn('Cache get failed:', e)
      return null
    }
  },

  remove: (key) => {
    try {
      sessionStorage.removeItem(CACHE_PREFIX + key)
    } catch (e) {
      console.warn('Cache remove failed:', e)
    }
  },

  clear: () => {
    try {
      Object.keys(sessionStorage).forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          sessionStorage.removeItem(key)
        }
      })
    } catch (e) {
      console.warn('Cache clear failed:', e)
    }
  }
}

export const cachedFetch = async (key, fetchFn, ttl) => {
  const cached = cache.get(key)
  if (cached) return cached

  const data = await fetchFn()
  cache.set(key, data, ttl)
  return data
}
