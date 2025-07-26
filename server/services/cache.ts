// Simple in-memory cache service for XPSwap
// This provides a lightweight caching solution without external dependencies

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class MemoryCache {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  /**
   * Set a value in cache with TTL (Time To Live)
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in milliseconds (default: 30 seconds)
   */
  set<T>(key: string, value: T, ttl: number = 30000): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl
    });
  }
  
  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached value or null if expired/not found
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data as T;
  }
  
  /**
   * Check if a key exists and is not expired
   * @param key Cache key
   * @returns true if exists and not expired
   */
  has(key: string): boolean {
    const value = this.get(key);
    return value !== null;
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Delete a specific key from cache
   * @param key Cache key
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    // Clean up expired entries first
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const cache = new MemoryCache();

// Cache key constants
export const CACHE_KEYS = {
  XP_PRICE: 'xp_price',
  MARKET_STATS: 'market_stats',
  TOKEN_LIST: 'token_list',
  POOL_DATA: 'pool_data',
  FARM_DATA: 'farm_data'
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  XP_PRICE: 30 * 1000,        // 30 seconds
  MARKET_STATS: 60 * 1000,    // 1 minute
  TOKEN_LIST: 5 * 60 * 1000,  // 5 minutes
  POOL_DATA: 10 * 1000,       // 10 seconds
  FARM_DATA: 30 * 1000        // 30 seconds
} as const;

export default cache;
