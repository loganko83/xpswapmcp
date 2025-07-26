// Analytics 관련 타입 정의
export interface TradingMetrics {
  totalVolume: string;
  volume24h: string;
  volumeChange: string;
  totalTrades: number;
  trades24h: number;
  averageTradeSize: string;
  totalFees: string;
  fees24h: string;
  uniqueTraders: number;
  activeTraders24h: number;
}

export interface VolumeData {
  timestamp: number;
  volume: number;
  trades: number;
  fees: number;
}

export interface TokenAnalytics {
  symbol: string;
  name: string;
  price: number;
  volume24h: number;
  volumeChange: number;
  marketCap: number;
  holders: number;
  transactions24h: number;
  liquidityUSD: number;
  priceChange24h: number;
}

export interface PairAnalytics {
  pairAddress: string;
  tokenA: string;
  tokenB: string;
  volume24h: number;
  volumeChange: number;
  liquidity: number;
  liquidityChange: number;
  fees24h: number;
  apr: number;
  trades24h: number;
}

export type TimeframeType = '1h' | '24h' | '7d' | '30d';
export type MetricType = 'volume' | 'trades' | 'fees' | 'liquidity';

// 공통 유틸리티 함수들
export const formatNumber = (num: number | string) => {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
  return n.toFixed(2);
};

export const formatCurrency = (amount: number | string) => {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${formatNumber(n)}`;
};

export const getChangeColor = (change: number) => {
  return change >= 0 ? "text-green-600" : "text-red-600";
};
