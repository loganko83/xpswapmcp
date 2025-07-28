import { useEffect, useState, useMemo } from 'react';
import { useWeb3Context } from '@/contexts/Web3Context';
import { getApiUrl } from '@/lib/apiUrl';
import { useMultiChainBalance } from './useMultiChainBalance';

export interface TokenBalance {
  balance: string;
  formattedBalance: string;
  decimals: number;
  symbol: string;
  network: string;
  usdValue?: number;
  error?: string;
}

export function useUniversalTokenBalance(tokenSymbol: string, network?: string) {
  const { wallet, chainId } = useWeb3Context();
  const { balances, isLoadingBalances, error: multiChainError } = useMultiChainBalance();
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>();

  // Determine the network to query
  const targetNetwork = useMemo(() => {
    if (network) return network;
    return getCurrentNetwork(chainId);
  }, [network, chainId]);

  // Get balance from multi-chain data first
  const multiChainBalance = useMemo(() => {
    if (!targetNetwork || targetNetwork === 'unknown') return null;
    
    const networkBalances = balances[targetNetwork];
    if (!networkBalances) return null;
    
    return networkBalances.find(t => 
      t.symbol.toUpperCase() === tokenSymbol.toUpperCase()
    );
  }, [balances, targetNetwork, tokenSymbol]);

  // State for API balance (fallback)
  const [apiBalance, setApiBalance] = useState<TokenBalance>({
    balance: '0',
    formattedBalance: '0',
    decimals: 18,
    symbol: tokenSymbol,
    network: targetNetwork
  });

  // Use multi-chain balance if available, otherwise fall back to API
  const balanceData = useMemo(() => {
    if (multiChainBalance) {
      return {
        balance: multiChainBalance.balance,
        formattedBalance: multiChainBalance.balance,
        decimals: 18,
        symbol: multiChainBalance.symbol,
        network: multiChainBalance.network,
        usdValue: multiChainBalance.usdValue,
        error: undefined
      };
    }
    return apiBalance;
  }, [multiChainBalance, apiBalance]);

  // Fetch from API if multi-chain balance is not available
  useEffect(() => {
    const fetchBalance = async () => {
      // Skip if we already have multi-chain balance
      if (multiChainBalance) {
        setIsLoading(false);
        return;
      }

      if (!wallet.isConnected || !wallet.address) {
        setApiBalance(prev => ({ ...prev, balance: '0', formattedBalance: '0' }));
        return;
      }

      setIsLoading(true);
      setApiError(undefined);

      try {
        console.log(`🔍 Fetching ${tokenSymbol} balance via API for ${wallet.address}`);
        
        const response = await fetch(getApiUrl(`/api/token-balance/${wallet.address}/${tokenSymbol}`));
        
        if (!response.ok) {
          throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log(`✅ Received ${tokenSymbol} balance from API:`, data);
        
        setApiBalance({
          balance: data.balance,
          formattedBalance: data.balance,
          decimals: data.decimals || 18,
          symbol: data.symbol,
          network: data.network || targetNetwork,
          usdValue: data.usdValue,
          error: undefined
        });
      } catch (err) {
        console.error(`❌ Failed to fetch ${tokenSymbol} balance from API:`, err);
        setApiError(err instanceof Error ? err.message : 'Failed to fetch balance');
        setApiBalance(prev => ({
          ...prev,
          balance: '0',
          formattedBalance: '0',
          error: err instanceof Error ? err.message : 'Failed to fetch balance'
        }));
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch if we don't have multi-chain balance
    if (!multiChainBalance) {
      fetchBalance();
    }
  }, [wallet.isConnected, wallet.address, tokenSymbol, targetNetwork, multiChainBalance]);

  return { 
    ...balanceData,
    isLoading: isLoadingBalances || isLoading,
    error: multiChainError || apiError || balanceData.error
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

// Enhanced hook to get all balances across multiple chains
export function useMultiChainBalances(tokenSymbol: string) {
  const { balances, isLoadingBalances, error } = useMultiChainBalance();
  
  const tokenBalances = useMemo(() => {
    const result: Record<string, TokenBalance> = {};
    
    Object.entries(balances).forEach(([network, tokens]) => {
      const token = tokens.find(t => t.symbol.toUpperCase() === tokenSymbol.toUpperCase());
      if (token) {
        result[network] = {
          balance: token.balance,
          formattedBalance: token.balance,
          decimals: 18,
          symbol: token.symbol,
          network: token.network,
          usdValue: token.usdValue
        };
      } else {
        // Still include networks where token doesn't exist
        result[network] = {
          balance: '0',
          formattedBalance: '0',
          decimals: 18,
          symbol: tokenSymbol,
          network: network,
          usdValue: 0
        };
      }
    });
    
    return result;
  }, [balances, tokenSymbol]);

  const totalValue = useMemo(() => {
    return Object.values(tokenBalances).reduce((total, balance) => {
      return total + (balance.usdValue || 0);
    }, 0);
  }, [tokenBalances]);

  return {
    balances: tokenBalances,
    totalValue,
    isLoading: isLoadingBalances,
    error
  };
}
