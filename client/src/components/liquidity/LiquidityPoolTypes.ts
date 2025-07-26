export interface LiquidityPool {
  id: number;
  tokenA: { symbol: string; name: string; address: string };
  tokenB: { symbol: string; name: string; address: string };
  tvl: string;
  apr: string;
  volume24h: string;
  fees24h: string;
  userLiquidity: string;
  userRewards: string;
  reserveA: string;
  reserveB: string;
  lpTokens: string;
  feeRate: string;
}

export interface AddLiquidityProps {
  pool: LiquidityPool;
  isOpen: boolean;
  onClose: () => void;
}

export interface RemoveLiquidityProps {
  pool: LiquidityPool;
  isOpen: boolean;
  onClose: () => void;
}

export interface PoolCardProps {
  pool: LiquidityPool;
  onAddLiquidity: (pool: LiquidityPool) => void;
  onRemoveLiquidity: (pool: LiquidityPool) => void;
}
