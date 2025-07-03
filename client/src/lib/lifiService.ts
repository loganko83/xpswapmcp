import { 
  getChains, 
  getTokens, 
  getQuote, 
  ChainId, 
  createConfig,
  Route,
  QuoteRequest,
  Token as LifiToken 
} from '@lifi/sdk';

// Initialize LI.FI SDK configuration
createConfig({
  integrator: 'XpSwap'
});

export interface BridgeQuote {
  id: string;
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  estimatedTime: number;
  gasCost: string;
  bridgeFee: string;
  routes: Route[];
  provider: string;
}

export interface SupportedChain {
  id: number;
  name: string;
  symbol: string;
  logoURI: string;
  rpcUrls: string[];
  blockExplorerUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
}

export class LiFiBridgeService {
  private chains: SupportedChain[] = [];
  private tokens: Map<number, LifiToken[]> = new Map();

  async initialize(): Promise<void> {
    try {
      // Get supported chains from LI.FI
      const chains = await getChains();
      this.chains = chains.map((chain: any) => ({
        id: chain.id,
        name: chain.name,
        symbol: chain.coin,
        logoURI: chain.logoURI || '',
        rpcUrls: [chain.metamask?.rpcUrls?.[0] || ''],
        blockExplorerUrls: [chain.metamask?.blockExplorerUrls?.[0] || ''],
        nativeCurrency: {
          name: chain.nativeCurrency?.name || chain.coin,
          symbol: chain.nativeCurrency?.symbol || chain.coin,
          decimals: chain.nativeCurrency?.decimals || 18,
        },
      }));

      // Load tokens for major chains
      const majorChains = [1, 56, 137, 42161, 10]; // ETH, BSC, Polygon, Arbitrum, Optimism
      for (const chainId of majorChains) {
        try {
          const tokensResponse = await getTokens({ chains: [chainId] });
          this.tokens.set(chainId, tokensResponse.tokens[chainId] || []);
        } catch (error) {
          console.warn(`Failed to load tokens for chain ${chainId}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to initialize LI.FI service:', error);
    }
  }

  getSupportedChains(): SupportedChain[] {
    return this.chains;
  }

  getTokensForChain(chainId: number): LifiToken[] {
    return this.tokens.get(chainId) || [];
  }

  async getBridgeQuote(
    fromChainId: number,
    toChainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    userAddress?: string
  ): Promise<BridgeQuote | null> {
    try {
      const quoteRequest: QuoteRequest = {
        fromChain: fromChainId as ChainId,
        toChain: toChainId as ChainId,
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        fromAmount: amount,
        fromAddress: userAddress,
        toAddress: userAddress,
      };

      const quote = await getQuote(quoteRequest);

      if (!quote) {
        return null;
      }

      return {
        id: quote.id || Date.now().toString(),
        fromChain: fromChainId,
        toChain: toChainId,
        fromToken: fromTokenAddress,
        toToken: toTokenAddress,
        fromAmount: amount,
        toAmount: quote.estimate.toAmount,
        estimatedTime: quote.estimate.executionDuration || 300, // 5 minutes default
        gasCost: quote.estimate.gasCosts?.[0]?.estimate || '0',
        bridgeFee: quote.estimate.feeCosts?.[0]?.amount || '0',
        routes: [quote],
        provider: quote.toolDetails?.name || 'LI.FI',
      };
    } catch (error) {
      console.error('Failed to get bridge quote:', error);
      return null;
    }
  }

  async executeBridge(route: Route, userAddress: string): Promise<string | null> {
    try {
      // This would typically integrate with the user's wallet
      // For now, we'll return a mock transaction hash
      console.log('Executing bridge transaction:', route);
      return '0x' + Math.random().toString(16).substr(2, 64);
    } catch (error) {
      console.error('Failed to execute bridge:', error);
      return null;
    }
  }

  async getTransactionStatus(txHash: string, chainId: number): Promise<'pending' | 'completed' | 'failed'> {
    try {
      // In a real implementation, this would check transaction status
      // For demo purposes, return completed after a delay
      return 'completed';
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      return 'failed';
    }
  }

  // Check if a chain is supported for bridging
  isChainSupported(chainId: number): boolean {
    return this.chains.some(chain => chain.id === chainId);
  }

  // Get the best bridge route between two chains
  async getBestRoute(
    fromChainId: number,
    toChainId: number,
    tokenSymbol: string,
    amount: string
  ): Promise<BridgeQuote | null> {
    const fromTokens = this.getTokensForChain(fromChainId);
    const toTokens = this.getTokensForChain(toChainId);

    const fromToken = fromTokens.find(t => t.symbol === tokenSymbol);
    const toToken = toTokens.find(t => t.symbol === tokenSymbol);

    if (!fromToken || !toToken) {
      return null;
    }

    return this.getBridgeQuote(
      fromChainId,
      toChainId,
      fromToken.address,
      toToken.address,
      amount
    );
  }
}

export const lifiService = new LiFiBridgeService();

// Network configurations for common chains with reliable free RPC endpoints
export const SUPPORTED_NETWORKS = {
  ETHEREUM: {
    chainId: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrls: [
      'https://eth.llamarpc.com',
      'https://rpc.ankr.com/eth',
      'https://ethereum.publicnode.com',
      'https://eth.rpc.blxrbdn.com'
    ],
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  BSC: {
    chainId: 56,
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrls: [
      'https://bsc-dataseed1.defibit.io',
      'https://bsc-dataseed.binance.org',
      'https://rpc.ankr.com/bsc',
      'https://bsc.publicnode.com'
    ],
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  POLYGON: {
    chainId: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc.ankr.com/polygon',
      'https://polygon.llamarpc.com',
      'https://polygon.publicnode.com'
    ],
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  ARBITRUM: {
    chainId: 42161,
    name: 'Arbitrum One',
    symbol: 'ETH',
    rpcUrls: [
      'https://arb1.arbitrum.io/rpc',
      'https://rpc.ankr.com/arbitrum',
      'https://arbitrum.publicnode.com',
      'https://arbitrum.llamarpc.com'
    ],
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  OPTIMISM: {
    chainId: 10,
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrls: [
      'https://mainnet.optimism.io',
      'https://rpc.ankr.com/optimism',
      'https://optimism.publicnode.com',
      'https://optimism.llamarpc.com'
    ],
    blockExplorer: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  XPHERE: {
    chainId: 20250217,
    name: 'Xphere',
    symbol: 'XP',
    rpcUrls: [
      'https://en-bkk.x-phere.com'
    ],
    blockExplorer: 'https://explorer.x-phere.com',
    nativeCurrency: {
      name: 'Xphere',
      symbol: 'XP',
      decimals: 18,
    },
  },
} as const;