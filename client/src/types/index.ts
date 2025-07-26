export interface WalletConnection {
  isConnected: boolean;
  address: string | null;
  balance: string;
  chainId: number | null;
  walletType: 'metamask' | 'zigap' | null;
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

// Security Dashboard Types
export interface SecurityStatus {
  overall: "secure" | "warning" | "critical";
  score: number;
  lastUpdated: number;
  systems: {
    reentrancy: boolean;
    mev_protection: boolean;
    circuit_breaker: boolean;
    slippage_protection: boolean;
    flash_loan_protection: boolean;
    governance_security: boolean;
    oracle_security: boolean;
    pause_mechanism: boolean;
  };
}

export interface SecurityAlert {
  id: string;
  type: "security" | "warning" | "info";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: number;
  source: string;
  action_required: boolean;
  resolved: boolean;
  affected_components: string[];
  resolution_steps?: string[];
}

export interface SecurityMetric {
  timestamp: string;
  threats_blocked: number;
  security_score: number;
  suspicious_activity: number;
  failed_attempts: number;
  successful_defenses: number;
}

export interface ThreatData {
  id: string;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  source: string;
  timestamp: number;
  status: "active" | "mitigated" | "investigating";
  affected_contracts: string[];
  mitigation_actions: string[];
}
