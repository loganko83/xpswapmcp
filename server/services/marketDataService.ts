// Example service using the cache decorator
import { Cacheable, cache, CACHE_KEYS, CACHE_TTL } from '../services/cache.js';

export class MarketDataService {
  // Using decorator for automatic caching
  @Cacheable({ 
    key: 'market:overview',
    ttl: CACHE_TTL.MARKET_STATS 
  })
  async getMarketOverview() {
    console.log('📊 Fetching market overview from data source...');
    
    // Simulate expensive operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      totalVolume: '125.4M',
      totalLiquidity: '89.2M',
      activeUsers: 15234,
      timestamp: new Date().toISOString()
    };
  }
  
  // Dynamic cache key based on parameters
  @Cacheable({
    key: (args) => `market:pair:${args[0]}`,
    ttl: 30000
  })
  async getPairData(pairId: string) {
    console.log(`📊 Fetching data for pair ${pairId}...`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      pairId,
      price: Math.random() * 100,
      volume24h: Math.random() * 1000000,
      change24h: (Math.random() - 0.5) * 20
    };
  }
  
  // Conditional caching based on result
  @Cacheable({
    ttl: 60000,
    condition: (result) => result.success === true
  })
  async getVolatileData() {
    const success = Math.random() > 0.5;
    
    return {
      success,
      data: success ? { value: Math.random() * 1000 } : null,
      timestamp: new Date().toISOString()
    };
  }
  
  // Manual cache management for complex scenarios
  async getAggregatedData() {
    const cacheKey = CACHE_KEYS.ANALYTICS_DATA;
    
    // Try cache first
    const cached = await cache.get(cacheKey);
    if (cached) {
      console.log('🚀 Aggregated data served from cache');
      return cached;
    }
    
    console.log('📊 Computing aggregated data...');
    
    // Parallel data fetching with individual caching
    const [overview, btcPair, ethPair] = await Promise.all([
      this.getMarketOverview(),
      this.getPairData('BTC/USDT'),
      this.getPairData('ETH/USDT')
    ]);
    
    const aggregated = {
      overview,
      topPairs: [btcPair, ethPair],
      computed: {
        totalValue: parseFloat(overview.totalVolume) + parseFloat(overview.totalLiquidity),
        avgChange: (btcPair.change24h + ethPair.change24h) / 2
      },
      timestamp: new Date().toISOString()
    };
    
    // Cache the aggregated result
    await cache.set(cacheKey, aggregated, CACHE_TTL.ANALYTICS_DATA);
    
    return aggregated;
  }
  
  // Cache warming/preloading
  async warmCache() {
    console.log('🔥 Warming cache...');
    
    const pairs = ['BTC/USDT', 'ETH/USDT', 'XP/USDT', 'XPS/USDT'];
    
    // Preload data in parallel
    await Promise.all([
      this.getMarketOverview(),
      ...pairs.map(pair => this.getPairData(pair))
    ]);
    
    console.log('✅ Cache warmed successfully');
  }
  
  // Cache statistics monitoring
  async getCacheHealth() {
    const stats = await cache.getStats();
    
    return {
      ...stats,
      status: stats.hitRate && stats.hitRate > 0.8 ? 'healthy' : 'needs-optimization',
      recommendation: stats.hitRate && stats.hitRate < 0.5 
        ? 'Consider increasing TTL or preloading more data'
        : 'Cache performing well'
    };
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();

// Example of cache-aware route handler
export async function cachedMarketHandler(req: any, res: any) {
  try {
    // Check if user wants fresh data
    const noCache = req.headers['x-no-cache'] === 'true';
    
    if (noCache) {
      // Clear cache for this request
      await cache.delete(CACHE_KEYS.MARKET_STATS);
    }
    
    // Get data (will use cache if available)
    const data = await marketDataService.getAggregatedData();
    
    // Add cache headers
    res.setHeader('X-Cache-Status', noCache ? 'BYPASSED' : 'CHECKED');
    
    res.json(data);
  } catch (error) {
    console.error('Market data error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
}

export default MarketDataService;
