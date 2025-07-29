import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SwapService } from '../../server/services/trading/swapService';
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
  BlockchainService: vi.fn()
}));

describe('SwapService', () => {
  let service: SwapService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new SwapService();
  });

  describe('getQuote', () => {
    it('should calculate swap quote for valid pair', async () => {
      const request = {
        fromToken: 'XP',
        toToken: 'XPS',
        amount: '1000'
      };

      const quote = await service.getQuote(request);

      expect(quote).toMatchObject({
        estimatedOut: expect.any(String),
        priceImpact: expect.any(String),
        route: ['XP', 'XPS'],
        fee: expect.any(String),
        feeToken: 'XP',
        slippage: 0.005,
        minimumOut: expect.any(String),
        executionPrice: expect.any(String),
        gasEstimate: expect.any(String)
      });
    });

    it('should reject unsupported trading pair', async () => {
      const request = {
        fromToken: 'XP',
        toToken: 'INVALID',
        amount: '1000'
      };

      await expect(service.getQuote(request)).rejects.toThrow(
        'Unsupported trading pair: XP/INVALID'
      );
    });

    it('should calculate correct fees', async () => {
      const request = {
        fromToken: 'XP',
        toToken: 'XPS',
        amount: '1000'
      };

      const quote = await service.getQuote(request);
      
      // Fee should be 0.3% of input
      const expectedFee = 1000 * 0.003;
      expect(parseFloat(quote.fee)).toBeCloseTo(expectedFee);
    });
  });

  describe('executeSwap', () => {
    it('should execute swap successfully', async () => {
      const request = {
        fromToken: 'XP',
        toToken: 'XPS',
        amount: '1000',
        from: '0x123...'
      };

      const result = await service.executeSwap(request);

      expect(result).toMatchObject({
        hash: expect.stringMatching(/^0x[a-f0-9]{64}$/),
        status: 'pending',
        from: '0x123...',
        to: '0x123...',
        fromToken: 'XP',
        toToken: 'XPS',
        amountIn: '1000',
        amountOut: expect.any(String),
        fee: expect.any(String),
        timestamp: expect.any(Number)
      });

      // Check if transaction was cached
      expect(cache.set).toHaveBeenCalledWith(
        expect.stringMatching(/^tx_0x/),
        expect.any(Object),
        3600
      );
    });

    it('should require wallet address', async () => {
      const request = {
        fromToken: 'XP',
        toToken: 'XPS',
        amount: '1000'
      };

      await expect(service.executeSwap(request)).rejects.toThrow(
        'Wallet address is required for swap execution'
      );
    });
  });

  describe('getSwapHistory', () => {
    it('should return empty array for new address', async () => {
      const history = await service.getSwapHistory('0x123...');
      expect(history).toEqual([]);
    });

    it('should return cached transactions for address', async () => {
      const mockTx = {
        hash: '0xabc...',
        status: 'confirmed',
        from: '0x123...',
        to: '0x123...',
        fromToken: 'XP',
        toToken: 'XPS',
        amountIn: '1000',
        amountOut: '60',
        fee: '3',
        timestamp: Date.now()
      };

      vi.mocked(cache.get).mockReturnValue(mockTx);

      const history = await service.getSwapHistory('0x123...', 1);
      
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject(mockTx);
    });
  });
});
