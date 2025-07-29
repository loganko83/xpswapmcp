import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FuturesService } from '../../server/services/advanced/futuresService';
import { BlockchainService } from '../../server/services/blockchain';
import { ApiError } from '../../server/utils/ApiError';

// Mock BlockchainService
vi.mock('../../server/services/blockchain');

describe('FuturesService', () => {
  let futuresService: FuturesService;
  let mockBlockchainService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    futuresService = new FuturesService();
    mockBlockchainService = vi.mocked(BlockchainService.prototype);
  });

  describe('getPerpetualMarkets', () => {
    const mockMarkets = [
      {
        pair: 'XP-USDT',
        markPrice: '1.0234',
        indexPrice: '1.0230',
        fundingRate: '0.0100',
        nextFundingTime: new Date().toISOString(),
        maxLeverage: 100
      },
      {
        pair: 'XPS-USDT',
        markPrice: '0.0156',
        indexPrice: '0.0155',
        fundingRate: '-0.0050',
        nextFundingTime: new Date().toISOString(),
        maxLeverage: 50
      }
    ];

    it('should return perpetual markets with additional data', async () => {
      mockBlockchainService.getPerpetualMarkets.mockResolvedValue(mockMarkets);

      const result = await futuresService.getPerpetualMarkets();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('volume24h');
      expect(result[0]).toHaveProperty('openInterest');
      expect(result[0].pair).toBe('XP-USDT');
    });

    it('should handle errors', async () => {
      mockBlockchainService.getPerpetualMarkets.mockRejectedValue(new Error('Network error'));

      await expect(futuresService.getPerpetualMarkets()).rejects.toThrow(ApiError);
    });
  });

  describe('openPosition', () => {
    const mockMarkets = [
      {
        pair: 'XP-USDT',
        markPrice: '1.0234',
        indexPrice: '1.0230',
        fundingRate: '0.0100',
        nextFundingTime: new Date().toISOString(),
        maxLeverage: 100
      }
    ];

    beforeEach(() => {
      mockBlockchainService.getPerpetualMarkets.mockResolvedValue(mockMarkets);
    });

    it('should open a long position', async () => {
      const result = await futuresService.openPosition(
        'XP-USDT',
        '10000',
        'LONG',
        10,
        '0x123'
      );

      expect(result.success).toBe(true);
      expect(result.txHash).toBeDefined();
      expect(result.position.side).toBe('LONG');
      expect(result.position.leverage).toBe(10);
      expect(result.position.margin).toBe('1000.0000');
    });

    it('should open a short position', async () => {
      const result = await futuresService.openPosition(
        'XP-USDT',
        '5000',
        'SHORT',
        5,
        '0x123'
      );

      expect(result.success).toBe(true);
      expect(result.position.side).toBe('SHORT');
      expect(result.position.leverage).toBe(5);
      expect(result.position.margin).toBe('1000.0000');
    });

    it('should reject invalid leverage', async () => {
      await expect(
        futuresService.openPosition('XP-USDT', '10000', 'LONG', 150, '0x123')
      ).rejects.toThrow('Leverage must be between 1 and 100');
    });

    it('should reject non-existent market', async () => {
      await expect(
        futuresService.openPosition('INVALID-USDT', '10000', 'LONG', 10, '0x123')
      ).rejects.toThrow('Market not found');
    });
  });

  describe('closePosition', () => {
    it('should close a profitable long position', async () => {
      const mockPositions = [{
        id: '1',
        wallet: '0x123',
        pair: 'XP-USDT',
        size: '10000',
        side: 'LONG',
        leverage: 10,
        entryPrice: '1.0100',
        markPrice: '1.0234',
        liquidationPrice: '0.9090',
        margin: '1000',
        unrealizedPnl: '134',
        fundingPaid: '-2.5',
        timestamp: new Date().toISOString()
      }];

      vi.spyOn(futuresService, 'getPositions').mockResolvedValue(mockPositions);

      const result = await futuresService.closePosition('1', '0x123');

      expect(result.success).toBe(true);
      expect(result.txHash).toBeDefined();
      expect(parseFloat(result.realizedPnl)).toBeGreaterThan(0);
    });

    it('should throw error for non-existent position', async () => {
      vi.spyOn(futuresService, 'getPositions').mockResolvedValue([]);

      await expect(
        futuresService.closePosition('999', '0x123')
      ).rejects.toThrow('Position not found');
    });
  });

  describe('updateLeverage', () => {
    it('should update position leverage', async () => {
      const mockPositions = [{
        id: '1',
        wallet: '0x123',
        pair: 'XP-USDT',
        size: '10000',
        side: 'LONG',
        leverage: 10,
        entryPrice: '1.0100',
        markPrice: '1.0234',
        liquidationPrice: '0.9090',
        margin: '1000',
        unrealizedPnl: '134',
        fundingPaid: '-2.5',
        timestamp: new Date().toISOString()
      }];

      vi.spyOn(futuresService, 'getPositions').mockResolvedValue(mockPositions);

      const result = await futuresService.updateLeverage('1', 20, '0x123');

      expect(result.success).toBe(true);
      expect(result.newMargin).toBe('500.0000');
    });

    it('should reject invalid leverage', async () => {
      await expect(
        futuresService.updateLeverage('1', 0, '0x123')
      ).rejects.toThrow('Leverage must be between 1 and 100');
    });
  });
});
