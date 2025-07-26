// Hybrid cache implementation (Memory + Redis)
import { ICacheService, CacheStats } from '../interfaces/ICache.js';
import { MemoryCache } from './memoryCache.js';
import { RedisCache } from './redisCache.js';

export class HybridCache implements ICacheService {
  private memoryCache: MemoryCache;
  private redisCache: RedisCache;
  private useRedis: boolean = false;
  
  constructor(options?: {
    memory?: { maxSize?: number; evictionPolicy?: 'LRU' | 'LFU' | 'FIFO' };
    redis?: {
      host?: string;
      port?: number;
      password?: string;
      db?: number;
      keyPrefix?: string;
    };
  }) {
    this.memoryCache = new MemoryCache(options?.memory);
    this.redisCache = new RedisCache(options?.redis);
    
    // Try to connect to Redis
    this.initRedis();
  }
  
  private async initRedis(): Promise<void> {
    try {
      await this.redisCache.connect();
      this.useRedis = true;
      console.log('Hybrid cache: Redis connected, using multi-tier caching');
    } catch (error) {
      console.log('Hybrid cache: Redis unavailable, using memory-only caching');
      this.useRedis = false;
    }
  }
  
  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    // Always set in memory cache for fast access
    await this.memoryCache.set(key, value, ttl);
    
    // Also set in Redis if available (async, don't wait)
    if (this.useRedis) {
      this.redisCache.set(key, value, ttl).catch(err => {
        console.error('Redis set error:', err);
      });
    }
  }
  
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first (L1)
    const memoryResult = await this.memoryCache.get<T>(key);
    if (memoryResult !== null) {
      return memoryResult;
    }
    
    // Try Redis cache (L2)
    if (this.useRedis) {
      try {
        const redisResult = await this.redisCache.get<T>(key);
        if (redisResult !== null) {
          // Populate memory cache for next access
          const ttl = await this.redisCache.ttl(key);
          if (ttl > 0) {
            await this.memoryCache.set(key, redisResult, ttl);
          }
          return redisResult;
        }
      } catch (error) {
        console.error('Redis get error:', error);
      }
    }
    
    return null;
  }
  
  async has(key: string): Promise<boolean> {
    // Check memory first
    if (await this.memoryCache.has(key)) {
      return true;
    }
    
    // Check Redis
    if (this.useRedis) {
      try {
        return await this.redisCache.has(key);
      } catch (error) {
        console.error('Redis has error:', error);
      }
    }
    
    return false;
  }
  
  async delete(key: string): Promise<boolean> {
    const memoryDeleted = await this.memoryCache.delete(key);
    
    if (this.useRedis) {
      try {
        await this.redisCache.delete(key);
      } catch (error) {
        console.error('Redis delete error:', error);
      }
    }
    
    return memoryDeleted;
  }
  
  async clear(): Promise<void> {
    await this.memoryCache.clear();
    
    if (this.useRedis) {
      try {
        await this.redisCache.clear();
      } catch (error) {
        console.error('Redis clear error:', error);
      }
    }
  }
  
  async getStats(): Promise<CacheStats> {
    const memoryStats = await this.memoryCache.getStats();
    
    if (this.useRedis) {
      try {
        const redisStats = await this.redisCache.getStats();
        // Combine stats
        return {
          size: memoryStats.size + redisStats.size,
          keys: [...new Set([...memoryStats.keys, ...redisStats.keys])],
          hits: (memoryStats.hits || 0) + (redisStats.hits || 0),
          misses: (memoryStats.misses || 0) + (redisStats.misses || 0),
          hitRate: memoryStats.hitRate // Use memory hit rate as primary metric
        };
      } catch (error) {
        console.error('Redis stats error:', error);
      }
    }
    
    return memoryStats;
  }
  
  async mset(items: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    await this.memoryCache.mset(items);
    
    if (this.useRedis) {
      this.redisCache.mset(items).catch(err => {
        console.error('Redis mset error:', err);
      });
    }
  }
  
  async mget(keys: string[]): Promise<Array<any | null>> {
    // Try to get all from memory first
    const memoryResults = await this.memoryCache.mget(keys);
    
    // Find missing keys
    const missingKeys: number[] = [];
    memoryResults.forEach((result, index) => {
      if (result === null) {
        missingKeys.push(index);
      }
    });
    
    // Try to get missing keys from Redis
    if (this.useRedis && missingKeys.length > 0) {
      try {
        const redisKeys = missingKeys.map(i => keys[i]);
        const redisResults = await this.redisCache.mget(redisKeys);
        
        // Merge results and update memory cache
        for (let i = 0; i < missingKeys.length; i++) {
          const index = missingKeys[i];
          const value = redisResults[i];
          if (value !== null) {
            memoryResults[index] = value;
            // Update memory cache async
            this.memoryCache.set(keys[index], value).catch(() => {});
          }
        }
      } catch (error) {
        console.error('Redis mget error:', error);
      }
    }
    
    return memoryResults;
  }
  
  async incr(key: string, amount?: number): Promise<number> {
    const result = await this.memoryCache.incr(key, amount);
    
    if (this.useRedis) {
      this.redisCache.incr(key, amount).catch(err => {
        console.error('Redis incr error:', err);
      });
    }
    
    return result;
  }
  
  async decr(key: string, amount?: number): Promise<number> {
    return this.incr(key, -(amount || 1));
  }
  
  async expire(key: string, ttl: number): Promise<boolean> {
    const memoryResult = await this.memoryCache.expire(key, ttl);
    
    if (this.useRedis) {
      this.redisCache.expire(key, ttl).catch(err => {
        console.error('Redis expire error:', err);
      });
    }
    
    return memoryResult;
  }
  
  async ttl(key: string): Promise<number> {
    const memoryTtl = await this.memoryCache.ttl(key);
    if (memoryTtl > 0) {
      return memoryTtl;
    }
    
    if (this.useRedis) {
      try {
        return await this.redisCache.ttl(key);
      } catch (error) {
        console.error('Redis ttl error:', error);
      }
    }
    
    return -1;
  }
}

export default HybridCache;
