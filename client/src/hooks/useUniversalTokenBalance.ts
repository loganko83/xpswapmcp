import { useEffect, useState } from 'react';
import { useWeb3Context } from '@/contexts/Web3Context';
import { getApiUrl } from '@/lib/apiUrl';

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
    network: network || getCurrentNetwork(chainId)
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
        console.log(`🔍 Fetching ${tokenSymbol} balance for ${wallet.address}`);
        
        // Call the API endpoint for token balance
        const response = await fetch(getApiUrl(`api/token-balance/${wallet.address}/${tokenSymbol}`));
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`✅ Received ${tokenSymbol} balance:`, data);
        
        setBalanceData({
          balance: data.balance,
          formattedBalance: data.balance,
          decimals: 18, // Standard decimals
          symbol: data.symbol,
          network: data.network || getCurrentNetwork(chainId),
          error: undefined
        });
      } catch (err) {
        console.error(`❌ Failed to fetch ${tokenSymbol} balance:`, err);
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

    // Poll for balance updates every 30 seconds (reduced frequency for API calls)
    const interval = setInterval(fetchBalance, 30000);

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