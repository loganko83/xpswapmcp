import { BlockchainService } from '../blockchain';
import { 
  Option, 
  OptionType, 
  OptionPosition, 
  OptionTrade,
  OptionMarket 
} from '../../../shared/types/advanced';
import { ApiError } from '../../utils/ApiError';

export class OptionsService {
  private blockchainService: BlockchainService;

  constructor() {
    this.blockchainService = new BlockchainService();
  }

  async getActiveOptions(underlying?: string, type?: OptionType): Promise<Option[]> {
    try {
      const options = await this.blockchainService.getActiveOptions();
      
      let filtered = options;
      if (underlying) {
        filtered = filtered.filter(opt => opt.underlying === underlying);
      }
      if (type) {
        filtered = filtered.filter(opt => opt.type === type);
      }

      return filtered;
    } catch (error) {
      throw new ApiError('Failed to fetch active options', 500);
    }
  }

  async getOptionMarkets(): Promise<OptionMarket[]> {
    try {
      const options = await this.blockchainService.getActiveOptions();
      
      return options.map(opt => ({
        id: opt.id,
        underlying: opt.underlying,
        strike: opt.strike,
        expiry: opt.expiry,
        type: opt.type,
        premium: opt.premium,
        openInterest: opt.openInterest,
        volume24h: Math.floor(Math.random() * 100000).toString(),
        iv: (20 + Math.random() * 80).toFixed(2)
      }));
    } catch (error) {
      throw new ApiError('Failed to fetch option markets', 500);
    }
  }

  async getPositions(wallet?: string): Promise<OptionPosition[]> {
    try {
      // In production, fetch from blockchain
      // For now, return mock data
      if (!wallet) {
        return [];
      }

      return [
        {
          id: '1',
          wallet,
          optionId: 'OPT-XP-1000-CALL-20250201',
          underlying: 'XP',
          strike: '1.0000',
          expiry: '2025-02-01T00:00:00Z',
          type: 'CALL' as OptionType,
          amount: '10',
          premium: '0.0234',
          currentValue: '0.0456',
          pnl: '0.0222',
          pnlPercentage: '94.87'
        }
      ];
    } catch (error) {
      throw new ApiError('Failed to fetch option positions', 500);
    }
  }

  async buyOption(
    optionId: string,
    amount: string,
    buyer: string
  ): Promise<OptionTrade> {
    try {
      // Validate option exists
      const options = await this.getActiveOptions();
      const option = options.find(o => o.id === optionId);
      
      if (!option) {
        throw new ApiError('Option not found', 404);
      }

      // Calculate total cost
      const totalCost = (parseFloat(option.premium) * parseFloat(amount)).toFixed(6);

      // In production, interact with smart contract
      const result: OptionTrade = {
        success: true,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        trade: {
          optionId,
          amount,
          premium: option.premium,
          totalCost,
          buyer,
          timestamp: new Date().toISOString()
        }
      };

      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to buy option', 500);
    }
  }

  async exerciseOption(
    optionId: string,
    amount: string,
    wallet: string
  ): Promise<{ success: boolean; txHash: string; payout: string }> {
    try {
      // Validate option and position
      const options = await this.getActiveOptions();
      const option = options.find(o => o.id === optionId);
      
      if (!option) {
        throw new ApiError('Option not found', 404);
      }

      // Check if option is in the money
      const currentPrice = 1.0234; // Mock current price
      const strikePrice = parseFloat(option.strike);
      
      const isITM = option.type === 'CALL' 
        ? currentPrice > strikePrice 
        : currentPrice < strikePrice;

      if (!isITM) {
        throw new ApiError('Option is not in the money', 400);
      }

      // Calculate payout
      const payout = option.type === 'CALL'
        ? ((currentPrice - strikePrice) * parseFloat(amount)).toFixed(6)
        : ((strikePrice - currentPrice) * parseFloat(amount)).toFixed(6);

      return {
        success: true,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        payout
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to exercise option', 500);
    }
  }

  async closePosition(
    positionId: string,
    wallet: string
  ): Promise<{ success: boolean; txHash: string; proceeds: string }> {
    try {
      // In production, verify position ownership and close
      const proceeds = (Math.random() * 0.1).toFixed(6);

      return {
        success: true,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        proceeds
      };
    } catch (error) {
      throw new ApiError('Failed to close position', 500);
    }
  }
}
