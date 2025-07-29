/**
 * Common type definitions for XPSwap API
 */

// Token types
export type TokenSymbol = 'XP' | 'XPS' | 'USDT' | 'ETH' | 'BNB' | 'MATIC' | 'AVAX';

export interface Token {
  symbol: TokenSymbol;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
  chainId: number;
}

// Price types
export interface PriceData {
  price: number;
  change24h: number;
  timestamp: string;
  symbol?: string;
  name?: string;
  marketCap?: number;
  volume24h?: number;
  circulatingSupply?: number;
  totalSupply?: number;
}

// Market types
export interface MarketStats {
  totalValueLocked: string;
  volume24h: string;
  totalTrades: number;
  activePairs: number;
  xpPrice: number;
  xpsPrice: number;
  topPairs: TradingPair[];
}

export interface TradingPair {
  pair: string;
  volume: string;
  price: string;
  change: string;
}

// Swap types
export interface SwapQuoteRequest {
  fromToken: string;
  toToken: string;
  amount: string;
  from?: string;
  to?: string;
}

export interface SwapQuoteResponse {
  estimatedOut: string;
  priceImpact: string;
  route: string[];
  fee: string;
  feeToken: string;
  slippage: number;
  minimumOut: string;
  executionPrice: string;
  gasEstimate: string;
}

export interface SwapExecuteRequest extends SwapQuoteRequest {
  slippage?: number;
  deadline?: number;
}

export interface SwapExecuteResponse {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  from: string;
  to: string;
  fromToken: string;
  toToken: string;
  amountIn: string;
  amountOut: string;
  fee: string;
  timestamp: number;
  blockNumber?: number;
}

// Pool types
export interface LiquidityPool {
  id: string;
  token0: Token;
  token1: Token;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  tvl: string;
  volume24h: string;
  fee: number;
  apy: number;
}

export interface PoolPosition {
  poolId: string;
  owner: string;
  liquidity: string;
  share: number;
  value: string;
  rewards: {
    token: string;
    amount: string;
  }[];
}

// Farm types
export interface Farm {
  id: string;
  name: string;
  stakingToken: Token;
  rewardToken: Token;
  tvl: string;
  apy: number;
  totalStaked: string;
  rewardsPerDay: string;
  startTime: number;
  endTime?: number;
}

export interface FarmPosition {
  farmId: string;
  owner: string;
  stakedAmount: string;
  pendingRewards: string;
  startTime: number;
}

// Transaction types
export interface Transaction {
  hash: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity' | 'stake' | 'unstake' | 'claim';
  status: 'pending' | 'confirmed' | 'failed';
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  meta?: {
    timestamp: number;
    [key: string]: any;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
