import { BlockchainService } from "../realBlockchain";
import { cache } from "../cache";
import { LiquidityPool, PoolPosition } from "../../../shared/types/api";

export interface AddLiquidityParams {
  tokenA: string;
  tokenB: string;
  amountA: string;
  amountB: string;
  slippage?: number;
  walletAddress: string;
}

export interface RemoveLiquidityParams {
  poolId: string;
  liquidity: string;
  slippage?: number;
  walletAddress: string;
}

export interface LiquidityResult {
  success: boolean;
  transactionHash: string;
  poolId: string;
  liquidity?: string;
  tokenAAmount?: string;
  tokenBAmount?: string;
}

export class LiquidityService {
  private readonly blockchainService: BlockchainService;
  private readonly CACHE_KEY_POOLS = 'liquidity_pools';
  private readonly CACHE_TTL = 60; // 1 minute

  constructor() {
    this.blockchainService = new BlockchainService();
  }

  /**
   * Get all liquidity pools with caching
   */
  async getPools(limit?: number, offset?: number): Promise<{
    pools: LiquidityPool[];
    total: number;
    limit: number;
    offset: number;
  }> {
    // Check cache
    const cachedPools = cache.get(this.CACHE_KEY_POOLS);
    let pools: LiquidityPool[];

    if (cachedPools) {
      pools = cachedPools as LiquidityPool[];
    } else {
      // Fetch from blockchain
      pools = await this.blockchainService.getLiquidityPools();
      cache.set(this.CACHE_KEY_POOLS, pools, this.CACHE_TTL);
    }

    // Apply pagination
    const paginatedPools = limit ? 
      pools.slice(offset || 0, (offset || 0) + limit) : 
      pools;

    return {
      pools: paginatedPools,
      total: pools.length,
      limit: limit || pools.length,
      offset: offset || 0
    };
  }

  /**
   * Get specific pool by ID
   */
  async getPoolById(poolId: string): Promise<LiquidityPool | null> {
    const { pools } = await this.getPools();
    return pools.find(pool => pool.id === poolId) || null;
  }

  /**
   * Add liquidity to a pool
   */
  async addLiquidity(params: AddLiquidityParams): Promise<LiquidityResult> {
    try {
      // Validate inputs
      this.validateAddLiquidityParams(params);

      // Call blockchain service
      const result = await this.blockchainService.addLiquidity(params);

      // Clear cache after successful operation
      cache.del(this.CACHE_KEY_POOLS);

      return result;
    } catch (error) {
      console.error("Error adding liquidity:", error);
      throw error;
    }
  }

  /**
   * Remove liquidity from a pool
   */
  async removeLiquidity(params: RemoveLiquidityParams): Promise<LiquidityResult> {
    try {
      // Validate inputs
      this.validateRemoveLiquidityParams(params);

      // Call blockchain service
      const result = await this.blockchainService.removeLiquidity(params);

      // Clear cache after successful operation
      cache.del(this.CACHE_KEY_POOLS);

      return result;
    } catch (error) {
      console.error("Error removing liquidity:", error);
      throw error;
    }
  }

  /**
   * Get user's liquidity positions
   */
  async getUserPositions(walletAddress: string): Promise<PoolPosition[]> {
    // In production, this would query the blockchain for user's positions
    const positions: PoolPosition[] = [];
    
    // Mock implementation for now
    const { pools } = await this.getPools();
    
    // Return empty array for now
    return positions;
  }

  /**
   * Calculate optimal liquidity amounts
   */
  async calculateOptimalAmounts(
    tokenA: string,
    tokenB: string,
    amountA: string
  ): Promise<{ amountA: string; amountB: string }> {
    // Find pool
    const { pools } = await this.getPools();
    const pool = pools.find(p => 
      (p.token0.symbol === tokenA && p.token1.symbol === tokenB) ||
      (p.token0.symbol === tokenB && p.token1.symbol === tokenA)
    );

    if (!pool) {
      throw new Error(`Pool not found for ${tokenA}/${tokenB}`);
    }

    // Calculate optimal amount based on current reserves
    const isToken0 = pool.token0.symbol === tokenA;
    const reserve0 = BigInt(pool.reserve0);
    const reserve1 = BigInt(pool.reserve1);
    const inputAmount = BigInt(amountA);

    const optimalAmountB = isToken0
      ? (inputAmount * reserve1) / reserve0
      : (inputAmount * reserve0) / reserve1;

    return {
      amountA,
      amountB: optimalAmountB.toString()
    };
  }

  /**
   * Validate add liquidity parameters
   */
  private validateAddLiquidityParams(params: AddLiquidityParams): void {
    const { tokenA, tokenB, amountA, amountB, walletAddress } = params;

    if (!tokenA || !tokenB) {
      throw new Error("Both tokens must be specified");
    }

    if (tokenA === tokenB) {
      throw new Error("Cannot add liquidity with the same token");
    }

    if (!amountA || !amountB || BigInt(amountA) <= 0n || BigInt(amountB) <= 0n) {
      throw new Error("Amounts must be greater than 0");
    }

    if (!walletAddress) {
      throw new Error("Wallet address is required");
    }
  }

  /**
   * Validate remove liquidity parameters
   */
  private validateRemoveLiquidityParams(params: RemoveLiquidityParams): void {
    const { poolId, liquidity, walletAddress } = params;

    if (!poolId) {
      throw new Error("Pool ID is required");
    }

    if (!liquidity || BigInt(liquidity) <= 0n) {
      throw new Error("Liquidity amount must be greater than 0");
    }

    if (!walletAddress) {
      throw new Error("Wallet address is required");
    }
  }
}

// Export singleton instance
export const liquidityService = new LiquidityService();
