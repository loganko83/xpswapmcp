// Web3 관련 타입 정의
export interface SwapQuote {
  amountOut: string;
  priceImpact: string;
  minimumReceived: string;
  gasEstimate: string;
  route: string[];
}

export interface TransactionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface StakingInfo {
  stakedAmount: string;
  lockPeriod: number;
  unlockTime: number;
  rewards: string;
}

export interface TokenDeploymentParams {
  name: string;
  symbol: string;
  totalSupply: string;
  recipientAddress: string;
  description?: string;
}

export interface PurchaseResult {
  success: boolean;
  transactionHash: string;
  buyerAddress: string;
  sellerAddress: string;
  xpAmount: string;
  xpsAmount: string;
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  iconUrls?: string[];
}
