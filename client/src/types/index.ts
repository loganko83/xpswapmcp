export interface WalletConnection {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
}

export interface Token {
  id: number;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl?: string;
  isActive: boolean;
}

export interface TradingPair {
  id: number;
  tokenA: Token;
  tokenB: Token;
  liquidityTokenA: string;
  liquidityTokenB: string;
  volume24h: string;
  price: string;
  priceChange24h: string;
  isActive: boolean;
}

export interface Transaction {
  id: number;
  userAddress: string;
  transactionHash: string;
  type: 'swap' | 'add_liquidity' | 'remove_liquidity';
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  createdAt: string;
}

export interface LiquidityPool {
  id: number;
  pair: TradingPair;
  totalLiquidity: string;
  apr: string;
  rewardTokens?: string[];
  isActive: boolean;
}

export interface SwapQuote {
  inputAmount: string;
  outputAmount: string;
  priceImpact: string;
  minimumReceived: string;
  route: string[];
  gasEstimate: string;
}

export interface NetworkConfig {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export interface MarketStats {
  totalValueLocked: string;
  volume24h: string;
  activePairs: number;
  xpPrice: string;
  marketCap: string;
  circulatingSupply: string;
  high24h: string;
  low24h: string;
}
