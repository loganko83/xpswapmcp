import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MarketDataService } from '../../server/services/trading/marketDataService';
import { cache } from '../../server/services/cache';

// Mock dependencies
vi.mock('../../server/services/cache', () => ({
  cache: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn()
  }
}));

vi.mock('../../server/services/realBlockchain', () => ({
  BlockchainService: vi.fn().mockImplementation(() => ({
    getMarketStats: vi.fn().mockResolvedValue({
      totalValueLocked: '10000000',
      volume24h: '500000',
      activePairs: 5
    })
  }))
}));

describe('MarketDataService', () => {
  let service: MarketDataService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MarketDataService();
  });

  describe('getMarketStats', () => {
    it('should return cached data if available', async () => {
      const cachedData = {
        totalValueLocked: '5000000',
        volume24h: '250000',
        totalTrades: 100,
        activePairs: 3,
        xpPrice: 0.02,
        xpsPrice: 1.0,
        topPairs: []
      };

      vi.mocked(cache.get).mockReturnValue(cachedData);

      const result = await service.getMarketStats();

      expect(cache.get).toHaveBeenCalledWith('market_stats');
      expect(result).toEqual(cachedData);
    });

    it('should fetch from blockchain if cache is empty', async () => {
      vi.mocked(cache.get).mockReturnValue(null);

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            '36056': {
              quote: {
                USD: {
                  price: 0.025,
                  percent_change_24h: 5.2
                }
              }
            }
          }
        })
      });

      const result = await service.getMarketStats();

      expect(cache.get).toHaveBeenCalledWith('market_stats');
      expect(result.totalValueLocked).toBe('10000000');
      expect(result.xpPrice).toBe(0.025);
      expect(cache.set).toHaveBeenCalled();
    });

    it('should use fallback price on API error', async () => {
      vi.mocked(cache.get).mockReturnValue(null);
      
      // Mock fetch error
      global.fetch = vi.fn().mockRejectedValue(new Error('API Error'));

      const result = await service.getMarketStats();

      expect(result.xpPrice).toBe(0.016571759599689175);
    });
  });

  describe('getXPPrice', () => {
    it('should return cached price if available', async () => {
      const cachedPrice = {
        price: 0.03,
        change24h: 2.5,
        timestamp: new Date().toISOString()
      };

      vi.mocked(cache.get).mockReturnValue(cachedPrice);

      const result = await service.getXPPrice();

      expect(cache.get).toHaveBeenCalledWith('xp_price');
      expect(result).toEqual(cachedPrice);
    });

    it('should fetch from API if cache is empty', async () => {
      vi.mocked(cache.get).mockReturnValue(null);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          data: {
            '36056': {
              quote: {
                USD: {
                  price: 0.035,
                  percent_change_24h: 3.8
                }
              }
            }
          }
        })
      });

      const result = await service.getXPPrice();

      expect(result.price).toBe(0.035);
      expect(result.change24h).toBe(3.8);
      expect(cache.set).toHaveBeenCalledWith(
        'xp_price',
        expect.objectContaining({ price: 0.035 }),
        60
      );
    });
  });

  describe('getXPSPrice', () => {
    it('should return pegged price of $1', async () => {
      const result = await service.getXPSPrice();

      expect(result.price).toBe(1.0);
      expect(result.symbol).toBe('XPS');
      expect(result.name).toBe('XPSwap Token');
    });

    it('should cache XPS price data', async () => {
      vi.mocked(cache.get).mockReturnValue(null);

      await service.getXPSPrice();

      expect(cache.set).toHaveBeenCalledWith(
        'xps_price',
        expect.objectContaining({ price: 1.0 }),
        60
      );
    });
  });
});
