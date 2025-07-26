// Cache factory for creating appropriate cache instances
import { ICacheService, CacheConfig } from '../interfaces/ICache.js';
import { MemoryCache } from './memoryCache.js';
import { RedisCache } from './redisCache.js';
import { HybridCache } from './hybridCache.js';

export class CacheFactory {
  private static instance: ICacheService | null = null;
  
  /**
   * Create a cache instance based on configuration
   */
  static create(config?: CacheConfig): ICacheService {
    const cacheType = config?.type || process.env.CACHE_TYPE || 'memory';
    
    switch (cacheType) {
      case 'redis':
        return new RedisCache(config?.redis);
        
      case 'hybrid':
        return new HybridCache({
          memory: {
            maxSize: config?.maxSize,
            evictionPolicy: config?.evictionPolicy
          },
          redis: config?.redis
        });
        
      case 'memory':
      default:
        return new MemoryCache({
          maxSize: config?.maxSize,
          evictionPolicy: config?.evictionPolicy
        });
    }
  }
  
  /**
   * Get singleton cache instance
   */
  static getInstance(config?: CacheConfig): ICacheService {
    if (!this.instance) {
      this.instance = this.create(config);
    }
    return this.instance;
  }
  
  /**
   * Reset singleton instance (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }
}

// Default cache instance using environment configuration
const cacheConfig: CacheConfig = {
  type: (process.env.CACHE_TYPE as any) || 'memory',
  defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '30000'),
  maxSize: parseInt(process.env.CACHE_MAX_SIZE || '1000'),
  evictionPolicy: (process.env.CACHE_EVICTION_POLICY as any) || 'LRU',
  redis: process.env.REDIS_URL ? {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: process.env.REDIS_KEY_PREFIX || 'xpswap:'
  } : undefined,
  cluster: {
    enabled: process.env.CLUSTER_MODE === 'true',
    nodeId: process.env.NODE_ID,
    syncInterval: parseInt(process.env.CLUSTER_SYNC_INTERVAL || '5000')
  }
};

// Export singleton cache instance
export const cache = CacheFactory.getInstance(cacheConfig);

// Re-export cache constants
export { CACHE_KEYS, CACHE_TTL } from './memoryCache.js';

export default CacheFactory;
