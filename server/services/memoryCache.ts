// Enhanced memory cache implementation with interface support
import { ICacheService, CacheStats } from '../interfaces/ICache.js';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits?: number;
}

export class MemoryCache implements ICacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  private stats = {
    hits: 0,
    misses: 0
  };
  private maxSize: number;
  private evictionPolicy: 'LRU' | 'LFU' | 'FIFO';
  
  constructor(options?: {
    maxSize?: number;
    evictionPolicy?: 'LRU' | 'LFU' | 'FIFO';
  }) {
    this.maxSize = options?.maxSize || 1000;
    this.evictionPolicy = options?.evictionPolicy || 'LRU';
  }
  
  async set<T>(key: string, value: T, ttl: number = 30000): Promise<void> {
    // Check if we need to evict items
    if (this.cache.size >= this.maxSize) {
      await this.evict();
    }
    
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
      hits: 0
    });
  }
  
  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    // Update hit count and stats
    item.hits = (item.hits || 0) + 1;
    this.stats.hits++;
    
    // Update timestamp for LRU
    if (this.evictionPolicy === 'LRU') {
      item.timestamp = Date.now();
    }
    
    return item.data as T;
  }
  
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }
  
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }
  
  async clear(): Promise<void> {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0 };
  }
  
  async getStats(): Promise<CacheStats> {
    // Clean up expired entries first
    await this.cleanup();
    
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100
    };
  }
  
  async mset(items: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    for (const item of items) {
      await this.set(item.key, item.value, item.ttl);
    }
  }
  
  async mget(keys: string[]): Promise<Array<any | null>> {
    const results = [];
    for (const key of keys) {
      results.push(await this.get(key));
    }
    return results;
  }
  
  async incr(key: string, amount: number = 1): Promise<number> {
    const current = await this.get<number>(key) || 0;
    const newValue = current + amount;
    await this.set(key, newValue);
    return newValue;
  }
  
  async decr(key: string, amount: number = 1): Promise<number> {
    return this.incr(key, -amount);
  }
  
  async expire(key: string, ttl: number): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) return false;
    
    item.ttl = ttl;
    item.timestamp = Date.now();
    return true;
  }
  
  async ttl(key: string): Promise<number> {
    const item = this.cache.get(key);
    if (!item) return -1;
    
    const remaining = item.ttl - (Date.now() - item.timestamp);
    return remaining > 0 ? remaining : -1;
  }
  
  private async cleanup(): Promise<void> {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
  
  private async evict(): Promise<void> {
    if (this.cache.size === 0) return;
    
    let keyToEvict: string | null = null;
    
    switch (this.evictionPolicy) {
      case 'LRU':
        // Find least recently used
        let oldestTime = Date.now();
        for (const [key, item] of this.cache.entries()) {
          if (item.timestamp < oldestTime) {
            oldestTime = item.timestamp;
            keyToEvict = key;
          }
        }
        break;
        
      case 'LFU':
        // Find least frequently used
        let minHits = Infinity;
        for (const [key, item] of this.cache.entries()) {
          const hits = item.hits || 0;
          if (hits < minHits) {
            minHits = hits;
            keyToEvict = key;
          }
        }
        break;
        
      case 'FIFO':
        // First in, first out
        keyToEvict = this.cache.keys().next().value;
        break;
    }
    
    if (keyToEvict) {
      this.cache.delete(keyToEvict);
    }
  }
}

// Export singleton instance for backward compatibility
export const memoryCache = new MemoryCache();

// Cache key constants
export const CACHE_KEYS = {
  XP_PRICE: 'xp_price',
  MARKET_STATS: 'market_stats',
  TOKEN_LIST: 'token_list',
  POOL_DATA: 'pool_data',
  FARM_DATA: 'farm_data',
  BRIDGE_NETWORKS: 'bridge_networks',
  OPTIONS_CONTRACTS: 'options_contracts',
  FUTURES_MARKETS: 'futures_markets',
  SECURITY_STATUS: 'security_status',
  ANALYTICS_DATA: 'analytics_data'
} as const;

// Cache TTL constants (in milliseconds)
export const CACHE_TTL = {
  XP_PRICE: 30 * 1000,          // 30 seconds
  MARKET_STATS: 60 * 1000,      // 1 minute
  TOKEN_LIST: 5 * 60 * 1000,    // 5 minutes
  POOL_DATA: 10 * 1000,         // 10 seconds
  FARM_DATA: 30 * 1000,         // 30 seconds
  BRIDGE_NETWORKS: 10 * 60 * 1000, // 10 minutes
  OPTIONS_CONTRACTS: 15 * 1000,    // 15 seconds
  FUTURES_MARKETS: 15 * 1000,      // 15 seconds
  SECURITY_STATUS: 5 * 1000,       // 5 seconds
  ANALYTICS_DATA: 2 * 60 * 1000    // 2 minutes
} as const;
