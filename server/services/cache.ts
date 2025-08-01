// Simple memory cache implementation
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SimpleCache {
  private cache = new Map<string, CacheItem<any>>();
  private hits = 0;
  private misses = 0;

  set<T>(key: string, value: T, ttl: number = 300000): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      this.misses++;
      return null;
    }

    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return item.data as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    const hitRate = this.hits + this.misses > 0 
      ? this.hits / (this.hits + this.misses) 
      : 0;
      
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hits: this.hits,
      misses: this.misses,
      hitRate
    };
  }
}

// Cache keys
export const CACHE_KEYS = {
  XP_PRICE: 'xp_price',
  MARKET_STATS: 'market_stats',
  TOKEN_LIST: 'token_list',
  POOL_DATA: 'pool_data',
  FARM_DATA: 'farm_data',
  USER_BALANCE: 'user_balance'
};

// Cache TTL (in milliseconds)
// Longer TTL for development, shorter for production
const isDevelopment = process.env.NODE_ENV === 'development';

export const CACHE_TTL = {
  XP_PRICE: isDevelopment ? 5 * 60 * 1000 : 30 * 1000,        // 5 minutes (dev) / 30 seconds (prod)
  MARKET_STATS: isDevelopment ? 10 * 60 * 1000 : 60 * 1000,   // 10 minutes (dev) / 1 minute (prod)
  TOKEN_LIST: 30 * 60 * 1000,  // 30 minutes
  POOL_DATA: isDevelopment ? 5 * 60 * 1000 : 30 * 1000,       // 5 minutes (dev) / 30 seconds (prod)
  FARM_DATA: isDevelopment ? 10 * 60 * 1000 : 60 * 1000,      // 10 minutes (dev) / 1 minute (prod)
  USER_BALANCE: isDevelopment ? 60 * 1000 : 10 * 1000         // 1 minute (dev) / 10 seconds (prod)
};

// Export singleton instance
export const cache = new SimpleCache();

export default cache;
