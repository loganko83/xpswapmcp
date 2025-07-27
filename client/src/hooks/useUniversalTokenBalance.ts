import { useEffect, useState } from 'react';
import { useWeb3Context } from '@/contexts/Web3Context';
import { web3Service } from '@/lib/web3';
import { ethers } from 'ethers';

// ERC20 ABI for balanceOf function
const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

// Network configurations
export const NETWORK_CONFIGS = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-key',
    tokens: {
      'ETH': 'native',
      'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
    }
  },
  bsc: {
    chainId: 56,
    name: 'BSC',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
    tokens: {
      'BNB': 'native',
      'BUSD': '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
      'CAKE': '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    }
  },
  xphere: {
    chainId: 20250217,
    name: 'Xphere',
    rpcUrl: 'https://en-bkk.x-phere.com',
    tokens: {
      'XP': 'native',
      'XPS': '0x17E0Cd7AaC2f1096F753649D605e45dA39DE7F68', // 배포된 XPSwapToken 주소 사용
      'XCR': '0x0C6bd4C7581cCc3205eC69BEaB6e6E89A27D45aE',
      'XEF': '0x80252c2d06bbd85699c555fc3633d5b8ee67c9ad',
      'ml': '0x889E7CA318d7653630E3e874597D2f35EE7ACc84',
    }
  }
};

export interface TokenBalance {
  balance: string;
  formattedBalance: string;
  decimals: number;
  symbol: string;
  network: string;
  error?: string;
}

export function useUniversalTokenBalance(tokenSymbol: string, network?: string) {
  const { wallet, chainId } = useWeb3Context();
  const [balanceData, setBalanceData] = useState<TokenBalance>({
    balance: '0',
    formattedBalance: '0',
    decimals: 18,
    symbol: tokenSymbol,
    network: network || 'unknown'
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!wallet.isConnected || !wallet.address) {
        setBalanceData(prev => ({ ...prev, balance: '0', formattedBalance: '0' }));
        return;
      }

      setIsLoading(true);

      try {
        // Determine current network
        const currentNetwork = network || getCurrentNetwork(chainId);
        const networkConfig = NETWORK_CONFIGS[currentNetwork as keyof typeof NETWORK_CONFIGS];
        
        if (!networkConfig) {
          throw new Error(`Unsupported network: ${currentNetwork}`);
        }

        // Check if we're on the right network
        if (chainId !== networkConfig.chainId && !network) {
          // If user is on wrong network and no specific network requested
          setBalanceData(prev => ({
            ...prev,
            balance: '0',
            formattedBalance: '0',
            error: `Please switch to ${networkConfig.name} network`
          }));
          return;
        }

        const tokenAddress = networkConfig.tokens[tokenSymbol as keyof typeof networkConfig.tokens];
        
        if (!tokenAddress) {
          // Token not available on this network
          setBalanceData(prev => ({
            ...prev,
            balance: '0',
            formattedBalance: '0',
            error: `${tokenSymbol} not available on ${networkConfig.name}`
          }));
          return;
        }

        let balance: string;
        let decimals = 18;

        // Get provider for specific network if requested
        const provider = network ? 
          new ethers.JsonRpcProvider(networkConfig.rpcUrl) : 
          web3Service.getProvider();

        if (!provider) {
          throw new Error('No provider available');
        }

        if (tokenAddress === 'native') {
          // Get native token balance
          const rawBalance = await provider.getBalance(wallet.address);
          balance = ethers.formatEther(rawBalance);
        } else {
          // Get ERC20 token balance
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const rawBalance = await contract.balanceOf(wallet.address);
          decimals = await contract.decimals();
          balance = ethers.formatUnits(rawBalance, decimals);
        }

        setBalanceData({
          balance: rawBalance.toString(),
          formattedBalance: balance,
          decimals,
          symbol: tokenSymbol,
          network: currentNetwork,
          error: undefined
        });
      } catch (err) {
        console.error(`Failed to fetch ${tokenSymbol} balance:`, err);
        setBalanceData(prev => ({
          ...prev,
          balance: '0',
          formattedBalance: '0',
          error: err instanceof Error ? err.message : 'Failed to fetch balance'
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();

    // Poll for balance updates every 10 seconds
    const interval = setInterval(fetchBalance, 10000);

    return () => clearInterval(interval);
  }, [wallet.isConnected, wallet.address, tokenSymbol, chainId, network]);

  return { 
    ...balanceData,
    isLoading
  };
}

// Helper function to determine network from chainId
function getCurrentNetwork(chainId: number | undefined): string {
  switch (chainId) {
    case 1:
      return 'ethereum';
    case 56:
      return 'bsc';
    case 20250217:
      return 'xphere';
    default:
      return 'unknown';
  }
}

// Hook to get all balances across multiple chains
export function useMultiChainBalances(tokenSymbol: string) {
  const ethereumBalance = useUniversalTokenBalance(tokenSymbol, 'ethereum');
  const bscBalance = useUniversalTokenBalance(tokenSymbol, 'bsc');
  const xphereBalance = useUniversalTokenBalance(tokenSymbol, 'xphere');

  const totalValue = calculateTotalValue([
    ethereumBalance,
    bscBalance,
    xphereBalance
  ]);

  return {
    ethereum: ethereumBalance,
    bsc: bscBalance,
    xphere: xphereBalance,
    totalValue,
    isLoading: ethereumBalance.isLoading || bscBalance.isLoading || xphereBalance.isLoading
  };
}

// Helper to calculate total value (would need price data in production)
function calculateTotalValue(balances: TokenBalance[]): number {
  // In production, this would fetch real-time prices and calculate USD value
  return balances.reduce((total, balance) => {
    return total + parseFloat(balance.formattedBalance);
  }, 0);
}