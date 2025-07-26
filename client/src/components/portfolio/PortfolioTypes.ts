export interface PortfolioAsset {
  symbol: string;
  name: string;
  balance: string;
  usdValue: number;
  price: number;
  change24h: number;
  allocation: number;
  staked?: string;
  rewards?: string;
  apy?: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent: number;
  totalStaked: number;
  totalRewards: number;
  portfolioAPY: number;
  riskScore: number;
  diversificationScore: number;
}

export interface PortfolioPosition {
  type: 'liquidity' | 'staking' | 'farming' | 'wallet';
  pair?: string;
  token: string;
  amount: string;
  usdValue: number;
  apy?: number;
  rewards?: string;
  duration?: string;
  risk: 'low' | 'medium' | 'high';
}

export interface PortfolioHistory {
  timestamp: number;
  totalValue: number;
  change: number;
}

export type TimeframeType = '24h' | '7d' | '30d' | '90d';
export type ViewType = 'overview' | 'positions' | 'performance' | 'analytics';
