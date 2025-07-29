import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OptionsService } from '../../server/services/advanced/optionsService';
import { BlockchainService } from '../../server/services/blockchain';
import { ApiError } from '../../server/utils/ApiError';

// Mock BlockchainService
vi.mock('../../server/services/blockchain');

describe('OptionsService', () => {
  let optionsService: OptionsService;
  let mockBlockchainService: any;

  beforeEach(() => {
    vi.clearAllMocks();
    optionsService = new OptionsService();
    mockBlockchainService = vi.mocked(BlockchainService.prototype);
  });

  describe('getActiveOptions', () => {
    const mockOptions = [
      {
        id: 'OPT-XP-1000-CALL-20250201',
        underlying: 'XP',
        strike: '1.0000',
        expiry: '2025-02-01T00:00:00Z',
        type: 'CALL',
        premium: '0.0234',
        openInterest: '1000',
        available: '5000'
      },
      {
        id: 'OPT-XPS-0015-PUT-20250201',
        underlying: 'XPS',
        strike: '0.0150',
        expiry: '2025-02-01T00:00:00Z',
        type: 'PUT',
        premium: '0.0012',
        openInterest: '500',
        available: '2000'
      }
    ];

    it('should return all active options', async () => {
      mockBlockchainService.getActiveOptions.mockResolvedValue(mockOptions);

      const result = await optionsService.getActiveOptions();

      expect(result).toEqual(mockOptions);
      expect(mockBlockchainService.getActiveOptions).toHaveBeenCalledTimes(1);
    });

    it('should filter by underlying asset', async () => {
      mockBlockchainService.getActiveOptions.mockResolvedValue(mockOptions);

      const result = await optionsService.getActiveOptions('XP');

      expect(result).toHaveLength(1);
      expect(result[0].underlying).toBe('XP');
    });

    it('should filter by option type', async () => {
      mockBlockchainService.getActiveOptions.mockResolvedValue(mockOptions);

      const result = await optionsService.getActiveOptions(undefined, 'PUT');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('PUT');
    });

    it('should handle errors', async () => {
      mockBlockchainService.getActiveOptions.mockRejectedValue(new Error('Network error'));

      await expect(optionsService.getActiveOptions()).rejects.toThrow(ApiError);
    });
  });

  describe('buyOption', () => {
    const mockOptions = [
      {
        id: 'OPT-XP-1000-CALL-20250201',
        underlying: 'XP',
        strike: '1.0000',
        expiry: '2025-02-01T00:00:00Z',
        type: 'CALL',
        premium: '0.0234',
        openInterest: '1000',
        available: '5000'
      }
    ];

    it('should successfully buy an option', async () => {
      mockBlockchainService.getActiveOptions.mockResolvedValue(mockOptions);

      const result = await optionsService.buyOption(
        'OPT-XP-1000-CALL-20250201',
        '10',
        '0x123'
      );

      expect(result.success).toBe(true);
      expect(result.txHash).toBeDefined();
      expect(result.trade.amount).toBe('10');
      expect(result.trade.totalCost).toBe('0.234000');
    });

    it('should throw error for non-existent option', async () => {
      mockBlockchainService.getActiveOptions.mockResolvedValue(mockOptions);

      await expect(
        optionsService.buyOption('INVALID-OPTION', '10', '0x123')
      ).rejects.toThrow('Option not found');
    });
  });

  describe('exerciseOption', () => {
    const mockOptions = [
      {
        id: 'OPT-XP-1000-CALL-20250201',
        underlying: 'XP',
        strike: '1.0000',
        expiry: '2025-02-01T00:00:00Z',
        type: 'CALL',
        premium: '0.0234',
        openInterest: '1000',
        available: '5000'
      }
    ];

    it('should exercise in-the-money call option', async () => {
      mockBlockchainService.getActiveOptions.mockResolvedValue(mockOptions);

      const result = await optionsService.exerciseOption(
        'OPT-XP-1000-CALL-20250201',
        '10',
        '0x123'
      );

      expect(result.success).toBe(true);
      expect(result.txHash).toBeDefined();
      expect(parseFloat(result.payout)).toBeGreaterThan(0);
    });

    it('should throw error for out-of-money option', async () => {
      const putOption = [{
        ...mockOptions[0],
        type: 'PUT',
        strike: '2.0000' // Strike is higher than current price
      }];
      
      mockBlockchainService.getActiveOptions.mockResolvedValue(putOption);

      await expect(
        optionsService.exerciseOption('OPT-XP-1000-CALL-20250201', '10', '0x123')
      ).rejects.toThrow('Option is not in the money');
    });
  });
});
