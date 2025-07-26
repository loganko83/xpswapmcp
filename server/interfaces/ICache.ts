// Cache interface for abstraction
// This allows easy switching between different cache implementations

export interface ICacheService {
  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  
  /**
   * Get a value from cache
   */
  get<T>(key: string): Promise<T | null>;
  
  /**
   * Check if a key exists
   */
  has(key: string): Promise<boolean>;
  
  /**
   * Delete a key from cache
   */
  delete(key: string): Promise<boolean>;
  
  /**
   * Clear all cache entries
   */
  clear(): Promise<void>;
  
  /**
   * Get cache statistics
   */
  getStats(): Promise<CacheStats>;
  
  /**
   * Set multiple values at once
   */
  mset(items: Array<{ key: string; value: any; ttl?: number }>): Promise<void>;
  
  /**
   * Get multiple values at once
   */
  mget(keys: string[]): Promise<Array<any | null>>;
  
  /**
   * Increment a numeric value
   */
  incr(key: string, amount?: number): Promise<number>;
  
  /**
   * Decrement a numeric value
   */
  decr(key: string, amount?: number): Promise<number>;
  
  /**
   * Set expiration time for a key
   */
  expire(key: string, ttl: number): Promise<boolean>;
  
  /**
   * Get remaining TTL for a key
   */
  ttl(key: string): Promise<number>;
}

export interface CacheStats {
  size: number;
  keys: string[];
  hits?: number;
  misses?: number;
  hitRate?: number;
}

// Cache configuration interface
export interface CacheConfig {
  type: 'memory' | 'redis' | 'hybrid';
  defaultTTL?: number;
  maxSize?: number;
  evictionPolicy?: 'LRU' | 'LFU' | 'FIFO';
  redis?: {
    host: string;
    port: number;
    password?: string;
    db?: number;
    keyPrefix?: string;
  };
  cluster?: {
    enabled: boolean;
    nodeId?: string;
    syncInterval?: number;
  };
}

// Decorator for automatic caching
export function Cacheable(options?: {
  key?: string | ((args: any[]) => string);
  ttl?: number;
  condition?: (result: any) => boolean;
}) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = typeof options?.key === 'function' 
        ? options.key(args)
        : options?.key || `${target.constructor.name}:${propertyName}:${JSON.stringify(args)}`;
      
      // Try to get from cache first
      const cached = await target.cache?.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      // Execute the original method
      const result = await method.apply(this, args);
      
      // Cache the result if condition is met
      if (!options?.condition || options.condition(result)) {
        await target.cache?.set(cacheKey, result, options?.ttl);
      }
      
      return result;
    };
    
    return descriptor;
  };
}

// Cache key builder utility
export class CacheKeyBuilder {
  private parts: string[] = [];
  
  constructor(private prefix: string) {
    this.parts.push(prefix);
  }
  
  add(part: string | number): this {
    this.parts.push(String(part));
    return this;
  }
  
  addHash(obj: any): this {
    const hash = this.hashObject(obj);
    this.parts.push(hash);
    return this;
  }
  
  build(): string {
    return this.parts.join(':');
  }
  
  private hashObject(obj: any): string {
    return Buffer.from(JSON.stringify(obj)).toString('base64').substring(0, 8);
  }
}

export default ICacheService;
