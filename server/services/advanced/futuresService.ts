import { BlockchainService } from '../blockchain';
import { 
  PerpetualMarket,
  FuturesPosition,
  FuturesTrade,
  OrderSide,
  FundingRate
} from '../../../shared/types/advanced';
import { ApiError } from '../../utils/ApiError';

export class FuturesService {
  private blockchainService: BlockchainService;
  
  // Mock funding rates for different pairs
  private fundingRates: Map<string, FundingRate> = new Map();

  constructor() {
    this.blockchainService = new BlockchainService();
    this.initializeFundingRates();
  }

  private initializeFundingRates() {
    // Initialize with mock funding rates
    this.fundingRates.set('XP-USDT', {
      pair: 'XP-USDT',
      rate: '0.0100',
      nextFundingTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    });
    this.fundingRates.set('XPS-USDT', {
      pair: 'XPS-USDT', 
      rate: '-0.0050',
      nextFundingTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString()
    });
  }

  async getPerpetualMarkets(): Promise<PerpetualMarket[]> {
    try {
      const perpetuals = await this.blockchainService.getPerpetualMarkets();
      
      return perpetuals.map(perp => ({
        ...perp,
        volume24h: (Math.random() * 1000000).toFixed(2),
        openInterest: (Math.random() * 500000).toFixed(2),
        fundingRate: this.fundingRates.get(perp.pair)?.rate || '0.0000',
        nextFundingTime: this.fundingRates.get(perp.pair)?.nextFundingTime || new Date().toISOString()
      }));
    } catch (error) {
      throw new ApiError('Failed to fetch perpetual markets', 500);
    }
  }

  async getPositions(wallet?: string): Promise<FuturesPosition[]> {
    try {
      if (!wallet) {
        return [];
      }

      // Mock user positions
      return [
        {
          id: '1',
          wallet,
          pair: 'XP-USDT',
          size: '10000',
          side: 'LONG' as OrderSide,
          leverage: 10,
          entryPrice: '1.0100',
          markPrice: '1.0234',
          liquidationPrice: '0.9090',
          margin: '1000',
          unrealizedPnl: '134',
          fundingPaid: '-2.5',
          timestamp: new Date().toISOString()
        }
      ];
    } catch (error) {
      throw new ApiError('Failed to fetch futures positions', 500);
    }
  }

  async openPosition(
    pair: string,
    size: string,
    side: OrderSide,
    leverage: number,
    wallet: string
  ): Promise<FuturesTrade> {
    try {
      // Validate market exists
      const markets = await this.getPerpetualMarkets();
      const market = markets.find(m => m.pair === pair);
      
      if (!market) {
        throw new ApiError('Market not found', 404);
      }

      // Validate leverage
      if (leverage < 1 || leverage > 100) {
        throw new ApiError('Leverage must be between 1 and 100', 400);
      }

      // Calculate position details
      const markPrice = parseFloat(market.markPrice);
      const margin = (parseFloat(size) / leverage).toFixed(4);
      
      // Calculate liquidation price (simplified)
      const liquidationBuffer = side === 'LONG' 
        ? 0.9 / leverage 
        : 1.1 / leverage;
      
      const liquidationPrice = side === 'LONG'
        ? (markPrice * (1 - liquidationBuffer)).toFixed(4)
        : (markPrice * (1 + liquidationBuffer)).toFixed(4);

      const result: FuturesTrade = {
        success: true,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        position: {
          id: Date.now().toString(),
          wallet,
          pair,
          size,
          side,
          leverage,
          entryPrice: markPrice.toFixed(4),
          markPrice: markPrice.toFixed(4),
          liquidationPrice,
          margin,
          unrealizedPnl: '0',
          fundingPaid: '0',
          timestamp: new Date().toISOString()
        }
      };

      return result;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to open perpetual position', 500);
    }
  }

  async closePosition(
    positionId: string,
    wallet: string
  ): Promise<{ success: boolean; txHash: string; realizedPnl: string }> {
    try {
      // In production, verify position ownership
      const positions = await this.getPositions(wallet);
      const position = positions.find(p => p.id === positionId);
      
      if (!position) {
        throw new ApiError('Position not found', 404);
      }

      // Calculate realized PnL
      const entryPrice = parseFloat(position.entryPrice);
      const markPrice = parseFloat(position.markPrice);
      const size = parseFloat(position.size);
      
      const pnl = position.side === 'LONG'
        ? ((markPrice - entryPrice) * size).toFixed(4)
        : ((entryPrice - markPrice) * size).toFixed(4);

      return {
        success: true,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        realizedPnl: pnl
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to close position', 500);
    }
  }

  async updateLeverage(
    positionId: string,
    newLeverage: number,
    wallet: string
  ): Promise<{ success: boolean; txHash: string; newMargin: string }> {
    try {
      // Validate leverage
      if (newLeverage < 1 || newLeverage > 100) {
        throw new ApiError('Leverage must be between 1 and 100', 400);
      }

      // In production, verify position ownership
      const positions = await this.getPositions(wallet);
      const position = positions.find(p => p.id === positionId);
      
      if (!position) {
        throw new ApiError('Position not found', 404);
      }

      // Calculate new margin requirement
      const size = parseFloat(position.size);
      const newMargin = (size / newLeverage).toFixed(4);

      return {
        success: true,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        newMargin
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('Failed to update leverage', 500);
    }
  }

  async getFundingHistory(pair: string, limit: number = 10): Promise<FundingRate[]> {
    try {
      // Mock funding history
      const history: FundingRate[] = [];
      const baseTime = Date.now();
      
      for (let i = 0; i < limit; i++) {
        history.push({
          pair,
          rate: ((Math.random() - 0.5) * 0.02).toFixed(4),
          nextFundingTime: new Date(baseTime - i * 8 * 60 * 60 * 1000).toISOString()
        });
      }

      return history;
    } catch (error) {
      throw new ApiError('Failed to fetch funding history', 500);
    }
  }
}
