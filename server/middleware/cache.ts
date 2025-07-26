// Cache middleware for easy integration with Express routes
import { Request, Response, NextFunction } from 'express';
import { cache, CACHE_TTL, CacheKeyBuilder } from '../services/cache.js';

export interface CacheOptions {
  /**
   * Cache key or function to generate cache key
   */
  key?: string | ((req: Request) => string);
  
  /**
   * TTL in milliseconds
   */
  ttl?: number;
  
  /**
   * Whether to cache based on conditions
   */
  condition?: (req: Request, res: Response) => boolean;
  
  /**
   * Whether to vary cache by user
   */
  varyByUser?: boolean;
  
  /**
   * Whether to vary cache by query parameters
   */
  varyByQuery?: boolean | string[];
  
  /**
   * Cache only successful responses
   */
  onlySuccess?: boolean;
}

/**
 * Cache middleware factory
 * 
 * Usage:
 * router.get('/api/data', cacheMiddleware({ ttl: 60000 }), handler);
 * router.get('/api/user-data', cacheMiddleware({ varyByUser: true }), handler);
 */
export function cacheMiddleware(options: CacheOptions = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Build cache key
    const cacheKey = buildCacheKey(req, options);
    
    // Try to get from cache
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        // Add cache headers
        res.setHeader('X-Cache', 'HIT');
        res.setHeader('X-Cache-Key', cacheKey);
        
        // Send cached response
        return res.json(cached);
      }
    } catch (error) {
      console.error('Cache get error:', error);
      // Continue without cache on error
    }
    
    // Cache miss - add cache headers
    res.setHeader('X-Cache', 'MISS');
    res.setHeader('X-Cache-Key', cacheKey);
    
    // Store original send function
    const originalSend = res.json.bind(res);
    
    // Override json method to cache the response
    res.json = function(data: any) {
      // Check if we should cache this response
      const shouldCache = options.onlySuccess !== false 
        ? res.statusCode >= 200 && res.statusCode < 300
        : true;
      
      if (shouldCache && (!options.condition || options.condition(req, res))) {
        // Cache the response asynchronously
        const ttl = options.ttl || CACHE_TTL.XP_PRICE; // Default 30s
        cache.set(cacheKey, data, ttl).catch(err => {
          console.error('Cache set error:', err);
        });
      }
      
      // Send the response
      return originalSend(data);
    };
    
    // Continue to the handler
    next();
  };
}

/**
 * Build cache key based on request and options
 */
function buildCacheKey(req: Request, options: CacheOptions): string {
  if (typeof options.key === 'function') {
    return options.key(req);
  }
  
  if (options.key) {
    return options.key;
  }
  
  // Build default cache key
  const builder = new CacheKeyBuilder('api');
  
  // Add path
  builder.add(req.path);
  
  // Add user ID if varyByUser is true
  if (options.varyByUser && (req as any).user?.id) {
    builder.add(`user:${(req as any).user.id}`);
  }
  
  // Add query parameters if varyByQuery is true
  if (options.varyByQuery) {
    if (Array.isArray(options.varyByQuery)) {
      // Only include specific query parameters
      const queryObj: any = {};
      for (const param of options.varyByQuery) {
        if (req.query[param] !== undefined) {
          queryObj[param] = req.query[param];
        }
      }
      if (Object.keys(queryObj).length > 0) {
        builder.addHash(queryObj);
      }
    } else {
      // Include all query parameters
      if (Object.keys(req.query).length > 0) {
        builder.addHash(req.query);
      }
    }
  }
  
  return builder.build();
}

/**
 * Cache invalidation middleware
 * Use this for POST/PUT/DELETE endpoints to clear related caches
 * 
 * Usage:
 * router.post('/api/data', invalidateCache('/api/data'), handler);
 */
export function invalidateCache(patterns: string | string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const patternsArray = Array.isArray(patterns) ? patterns : [patterns];
    
    try {
      const stats = await cache.getStats();
      const keysToDelete = stats.keys.filter(key => {
        return patternsArray.some(pattern => key.includes(pattern));
      });
      
      // Delete matching keys
      for (const key of keysToDelete) {
        await cache.delete(key);
      }
      
      res.setHeader('X-Cache-Invalidated', keysToDelete.length.toString());
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
    
    next();
  };
}

/**
 * Conditional cache middleware based on request
 * 
 * Usage:
 * router.get('/api/data', conditionalCache((req) => !req.headers['x-no-cache']), handler);
 */
export function conditionalCache(
  condition: (req: Request) => boolean,
  options: CacheOptions = {}
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (condition(req)) {
      return cacheMiddleware(options)(req, res, next);
    }
    next();
  };
}

// Pre-configured cache middleware for common use cases
export const cacheShort = cacheMiddleware({ ttl: 10 * 1000 }); // 10 seconds
export const cacheMedium = cacheMiddleware({ ttl: 60 * 1000 }); // 1 minute
export const cacheLong = cacheMiddleware({ ttl: 5 * 60 * 1000 }); // 5 minutes
export const cacheVeryLong = cacheMiddleware({ ttl: 60 * 60 * 1000 }); // 1 hour

// User-specific cache
export const cacheUser = cacheMiddleware({ 
  varyByUser: true, 
  ttl: 30 * 1000 
});

// Query-aware cache
export const cacheQuery = cacheMiddleware({ 
  varyByQuery: true, 
  ttl: 30 * 1000 
});

export default cacheMiddleware;
