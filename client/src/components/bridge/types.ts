export interface SupportedNetwork {
  chainId: number;
  name: string;
  symbol: string;
  logo: string;
  rpcUrl: string;
  blockExplorer: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  isConnected: boolean;
}

export interface BridgeToken {
  symbol: string;
  name: string;
  networks: number[];
  minAmount: string;
  maxAmount: string;
  decimals: number;
  logo: string;
}

export interface BridgeTransaction {
  id: string;
  fromChainId: number;
  toChainId: number;
  fromToken: { symbol: string; name: string };
  toToken: { symbol: string; name: string };
  amount: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fromTxHash?: string;
  toTxHash?: string;
  timestamp: number;
  estimatedCompletion: number;
  currentStep?: string;
  steps?: { name: string; status: string; txHash?: string }[];
}

export interface BridgeData {
  fromNetwork: SupportedNetwork;
  toNetwork: SupportedNetwork;
  token: BridgeToken;
  amount: string;
  fee: string;
  estimatedTime: string;
}

export interface MultiChainBalance {
  chainId: number;
  chainName: string;
  nativeSymbol: string;
  nativeBalance: string;
  tokens: {
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
  }[];
}
