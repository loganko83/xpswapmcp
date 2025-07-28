import { LiFi, ChainId, Token, Route } from '@lifi/sdk';
import { ethers } from 'ethers';

// Multi-chain RPC endpoints
export const CHAIN_CONFIGS = {
  [ChainId.ETH]: {
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrls: [
      import.meta.env.VITE_INFURA_API_URL || 'https://ethereum.publicnode.com',
      import.meta.env.VITE_ALCHEMY_API_URL || 'https://rpc.ankr.com/eth',
      'https://ethereum.publicnode.com',
      'https://rpc.ankr.com/eth'
    ],
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  [ChainId.BSC]: {
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    rpcUrls: [
      'https://bsc-dataseed1.binance.org',
      'https://bsc-dataseed2.binance.org',
      'https://bsc-dataseed3.binance.org',
      'https://bsc-dataseed4.binance.org'
    ],
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    }
  },
  [ChainId.POL]: {
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrls: [
      'https://polygon-rpc.com',
      'https://rpc-mainnet.maticvigil.com',
      'https://rpc.ankr.com/polygon'
    ],
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    }
  },
  [ChainId.ARB]: {
    name: 'Arbitrum',
    symbol: 'ETH',
    rpcUrls: [
      'https://arb1.arbitrum.io/rpc',
      'https://rpc.ankr.com/arbitrum'
    ],
    blockExplorer: 'https://arbiscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  },
  [ChainId.OPT]: {
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrls: [
      'https://mainnet.optimism.io',
      'https://rpc.ankr.com/optimism'
    ],
    blockExplorer: 'https://optimistic.etherscan.io',
    nativeCurrency: {
      name: 'Ether',
      symbol: 'ETH',
      decimals: 18
    }
  }
};

// Xphere Network Configuration
export const XPHERE_CHAIN_CONFIG = {
  chainId: 20250217,
  name: 'Xphere',
  symbol: 'XP',
  rpcUrls: ['https://en-bkk.x-phere.com'],
  blockExplorer: 'https://explorer.x-phere.com',
  nativeCurrency: {
    name: 'XP',
    symbol: 'XP',
    decimals: 18
  }
};

export interface CrossChainBalance {
  chainId: number;
  chainName: string;
  nativeBalance: string;
  tokens: {
    address: string;
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
    price?: number;
    usdValue?: number;
  }[];
}

export interface BridgeQuote {
  fromChainId: number;
  toChainId: number;
  fromToken: Token;
  toToken: Token;
  fromAmount: string;
  toAmount: string;
  estimatedTime: number;
  fees: {
    gas: string;
    bridge: string;
    total: string;
  };
  route: Route;
}

export interface BridgeTransaction {
  id: string;
  fromChainId: number;
  toChainId: number;
  fromToken: Token;
  toToken: Token;
  amount: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fromTxHash?: string;
  toTxHash?: string;
  timestamp: number;
  estimatedCompletion: number;
  currentStep: string;
  steps: {
    name: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    txHash?: string;
  }[];
}

export class CrossChainService {
  private lifi: LiFi;
  private providers: Map<number, ethers.JsonRpcProvider> = new Map();

  constructor() {
    this.lifi = new LiFi({
      integrator: 'xpswap',
      defaultRouteOptions: {
        slippage: 0.005, // 0.5%
        maxPriceImpact: 0.4, // 40%
        allowDestinationCall: false
      }
    });
    
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize providers for each supported chain
    Object.entries(CHAIN_CONFIGS).forEach(([chainId, config]) => {
      const provider = this.createFallbackProvider(config.rpcUrls);
      this.providers.set(parseInt(chainId), provider);
    });

    // Add Xphere provider
    const xphereProvider = new ethers.JsonRpcProvider(XPHERE_CHAIN_CONFIG.rpcUrls[0]);
    this.providers.set(XPHERE_CHAIN_CONFIG.chainId, xphereProvider);
  }

  private createFallbackProvider(rpcUrls: string[]): ethers.JsonRpcProvider {
    // Use the first available RPC URL as primary
    return new ethers.JsonRpcProvider(rpcUrls[0]);
  }

  async getMultiChainBalances(address: string): Promise<CrossChainBalance[]> {
    const balances: CrossChainBalance[] = [];
    
    for (const [chainId, provider] of this.providers) {
      try {
        // Get native token balance
        const nativeBalance = await provider.getBalance(address);
        const nativeBalanceFormatted = ethers.formatEther(nativeBalance);
        
        const chainConfig = chainId === XPHERE_CHAIN_CONFIG.chainId 
          ? XPHERE_CHAIN_CONFIG 
          : CHAIN_CONFIGS[chainId as ChainId];
        
        if (!chainConfig) continue;

        const chainBalance: CrossChainBalance = {
          chainId,
          chainName: chainConfig.name,
          nativeBalance: nativeBalanceFormatted,
          tokens: []
        };

        // Get common ERC20 token balances
        const commonTokens = await this.getCommonTokensForChain(chainId);
        
        for (const token of commonTokens) {
          try {
            const tokenContract = new ethers.Contract(
              token.address,
              ['function balanceOf(address) view returns (uint256)', 'function decimals() view returns (uint8)'],
              provider
            );
            
            const balance = await tokenContract.balanceOf(address);
            const decimals = await tokenContract.decimals();
            const balanceFormatted = ethers.formatUnits(balance, decimals);
            
            if (parseFloat(balanceFormatted) > 0) {
              chainBalance.tokens.push({
                address: token.address,
                symbol: token.symbol,
                name: token.name,
                balance: balanceFormatted,
                decimals: decimals
              });
            }
          } catch (error) {
            console.warn(`Failed to get ${token.symbol} balance on ${chainConfig.name}:`, error);
          }
        }

        balances.push(chainBalance);
      } catch (error) {
        console.warn(`Failed to get balances for chain ${chainId}:`, error);
      }
    }

    return balances;
  }

  async getBridgeQuote(
    fromChainId: number,
    toChainId: number,
    fromTokenAddress: string,
    toTokenAddress: string,
    amount: string,
    userAddress: string
  ): Promise<BridgeQuote> {
    try {
      const fromChain = await this.lifi.getChain(fromChainId);
      const toChain = await this.lifi.getChain(toChainId);
      
      const fromToken = await this.lifi.getToken(fromChainId, fromTokenAddress);
      const toToken = await this.lifi.getToken(toChainId, toTokenAddress);
      
      const routeRequest = {
        fromChainId,
        toChainId,
        fromTokenAddress,
        toTokenAddress,
        fromAmount: ethers.parseUnits(amount, fromToken.decimals).toString(),
        fromAddress: userAddress,
        toAddress: userAddress,
        options: {
          slippage: 0.005,
          maxPriceImpact: 0.4,
          allowDestinationCall: false
        }
      };

      const routes = await this.lifi.getRoutes(routeRequest);
      
      if (!routes.routes || routes.routes.length === 0) {
        throw new Error('No routes found for this bridge');
      }

      const bestRoute = routes.routes[0];
      const gasFee = bestRoute.steps.reduce((acc, step) => acc + parseFloat(step.estimate.gasCosts[0].amount), 0);
      const bridgeFee = bestRoute.steps.reduce((acc, step) => acc + parseFloat(step.estimate.feeCosts[0]?.amount || '0'), 0);
      
      return {
        fromChainId,
        toChainId,
        fromToken,
        toToken,
        fromAmount: amount,
        toAmount: ethers.formatUnits(bestRoute.toAmount, toToken.decimals),
        estimatedTime: bestRoute.steps.reduce((acc, step) => acc + step.estimate.executionDuration, 0),
        fees: {
          gas: gasFee.toString(),
          bridge: bridgeFee.toString(),
          total: (gasFee + bridgeFee).toString()
        },
        route: bestRoute
      };
    } catch (error) {
      console.error('Failed to get bridge quote:', error);
      throw error;
    }
  }

  async executeBridge(
    route: Route,
    userAddress: string,
    signer: ethers.Signer
  ): Promise<BridgeTransaction> {
    try {
      const transaction = await this.lifi.executeRoute(signer, route);
      
      const bridgeTransaction: BridgeTransaction = {
        id: transaction.transactionHash || `bridge_${Date.now()}`,
        fromChainId: route.fromChainId,
        toChainId: route.toChainId,
        fromToken: route.fromToken,
        toToken: route.toToken,
        amount: ethers.formatUnits(route.fromAmount, route.fromToken.decimals),
        status: 'processing',
        fromTxHash: transaction.transactionHash,
        timestamp: Date.now(),
        estimatedCompletion: Date.now() + (route.steps.reduce((acc, step) => acc + step.estimate.executionDuration, 0) * 1000),
        currentStep: 'Initiating bridge transaction',
        steps: route.steps.map(step => ({
          name: step.tool,
          status: 'pending' as const
        }))
      };

      return bridgeTransaction;
    } catch (error) {
      console.error('Failed to execute bridge:', error);
      throw error;
    }
  }

  async trackBridgeTransaction(transactionId: string): Promise<BridgeTransaction> {
    try {
      const status = await this.lifi.getStatus({
        txHash: transactionId,
        bridge: 'lifi'
      });

      // Convert LiFi status to our format
      const bridgeStatus = this.mapLiFiStatus(status.status);
      
      return {
        id: transactionId,
        fromChainId: status.fromChain,
        toChainId: status.toChain,
        fromToken: status.fromToken,
        toToken: status.toToken,
        amount: ethers.formatUnits(status.fromAmount, status.fromToken.decimals),
        status: bridgeStatus,
        fromTxHash: status.fromTxHash,
        toTxHash: status.toTxHash,
        timestamp: status.timestamp,
        estimatedCompletion: status.estimatedCompletion,
        currentStep: this.getCurrentStep(status),
        steps: status.steps?.map(step => ({
          name: step.tool,
          status: this.mapStepStatus(step.status),
          txHash: step.txHash
        })) || []
      };
    } catch (error) {
      console.error('Failed to track bridge transaction:', error);
      throw error;
    }
  }

  private mapLiFiStatus(status: string): BridgeTransaction['status'] {
    switch (status) {
      case 'DONE':
        return 'completed';
      case 'FAILED':
        return 'failed';
      case 'PENDING':
        return 'processing';
      default:
        return 'pending';
    }
  }

  private mapStepStatus(status: string): 'pending' | 'processing' | 'completed' | 'failed' {
    switch (status) {
      case 'DONE':
        return 'completed';
      case 'FAILED':
        return 'failed';
      case 'PENDING':
        return 'processing';
      default:
        return 'pending';
    }
  }

  private getCurrentStep(status: any): string {
    if (status.status === 'DONE') return 'Bridge completed';
    if (status.status === 'FAILED') return 'Bridge failed';
    
    const currentStep = status.steps?.find((step: any) => step.status === 'PENDING');
    return currentStep ? `Processing ${currentStep.tool}` : 'Processing bridge';
  }

  private async getCommonTokensForChain(chainId: number): Promise<{address: string, symbol: string, name: string}[]> {
    // Return common tokens for each chain
    const commonTokens: Record<number, {address: string, symbol: string, name: string}[]> = {
      [ChainId.ETH]: [
        { address: '0xA0b86a33E6441b4ba578d6E1B51A916D05bF9fd7', symbol: 'USDT', name: 'Tether USD' },
        { address: '0xA0b86a33E6441b4ba578d6E1B51A916D05bF9fd7', symbol: 'USDC', name: 'USD Coin' },
        { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC', name: 'Wrapped Bitcoin' }
      ],
      [ChainId.BSC]: [
        { address: '0x55d398326f99059fF775485246999027B3197955', symbol: 'USDT', name: 'Tether USD' },
        { address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', symbol: 'USDC', name: 'USD Coin' },
        { address: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', symbol: 'BTCB', name: 'Bitcoin BEP2' }
      ],
      [ChainId.POL]: [
        { address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', symbol: 'USDT', name: 'Tether USD' },
        { address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', symbol: 'USDC', name: 'USD Coin' },
        { address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6', symbol: 'WBTC', name: 'Wrapped Bitcoin' }
      ],
      [XPHERE_CHAIN_CONFIG.chainId]: [
        { address: '0xf1bA1aF6fae54C0f9d82C1d12aeF0c57543F12e2', symbol: 'XPS', name: 'XpSwap Token' }
      ]
    };

    return commonTokens[chainId] || [];
  }

  async addNetworkToWallet(chainId: number): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
      const chainConfig = chainId === XPHERE_CHAIN_CONFIG.chainId 
        ? XPHERE_CHAIN_CONFIG 
        : CHAIN_CONFIGS[chainId as ChainId];
      
      if (!chainConfig) return false;

      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${chainId.toString(16)}`,
          chainName: chainConfig.name,
          nativeCurrency: chainConfig.nativeCurrency,
          rpcUrls: chainConfig.rpcUrls,
          blockExplorerUrls: [chainConfig.blockExplorer]
        }]
      });

      return true;
    } catch (error) {
      console.error('Failed to add network to wallet:', error);
      return false;
    }
  }

  async switchNetwork(chainId: number): Promise<boolean> {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      });

      return true;
    } catch (error) {
      console.error('Failed to switch network:', error);
      
      // If network doesn't exist, try to add it
      if ((error as any).code === 4902) {
        return await this.addNetworkToWallet(chainId);
      }
      
      return false;
    }
  }
}

export const crossChainService = new CrossChainService();