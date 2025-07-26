// Export the new cache system for backward compatibility
export { 
  cache, 
  CACHE_KEYS, 
  CACHE_TTL,
  CacheFactory 
} from './cacheFactory.js';

export { ICacheService, CacheConfig, Cacheable, CacheKeyBuilder } from '../interfaces/ICache.js';
export { MemoryCache } from './memoryCache.js';
export { RedisCache } from './redisCache.js';
export { HybridCache } from './hybridCache.js';

// Default export for simple imports
import { cache as defaultCache } from './cacheFactory.js';
export default defaultCache;
