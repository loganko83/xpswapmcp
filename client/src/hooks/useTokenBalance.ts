import { useMultiChainBalance } from './useMultiChainBalance';
import { useWeb3Context } from '@/contexts/Web3Context';
import { useMemo } from 'react';

// Enhanced hook that uses multi-chain balance functionality
export function useTokenBalance(tokenSymbol: string) {
  const { chainId } = useWeb3Context();
  const { balances, isLoadingBalances, networkTotals, error } = useMultiChainBalance();
  
  // Determine current network from chainId
  const currentNetwork = useMemo(() => {
    switch (chainId) {
      case 1:
        return 'ethereum';
      case 56:
        return 'bsc';
      case 20250217:
        return 'xphere';
      default:
        return null;
    }
  }, [chainId]);

  // Get balance for the specific token on the current network
  const tokenBalance = useMemo(() => {
    if (!currentNetwork || !balances[currentNetwork]) {
      return {
        balance: '0',
        formattedBalance: '0',
        usdValue: 0
      };
    }

    const networkTokens = balances[currentNetwork];
    const token = networkTokens.find(t => t.symbol.toUpperCase() === tokenSymbol.toUpperCase());
    
    return {
      balance: token?.balance || '0',
      formattedBalance: token?.balance || '0',
      usdValue: token?.usdValue || 0
    };
  }, [currentNetwork, balances, tokenSymbol]);

  // Get balances across all networks for this token
  const allNetworkBalances = useMemo(() => {
    const result: Record<string, { balance: string; usdValue: number }> = {};
    
    Object.entries(balances).forEach(([network, tokens]) => {
      const token = tokens.find(t => t.symbol.toUpperCase() === tokenSymbol.toUpperCase());
      if (token) {
        result[network] = {
          balance: token.balance,
          usdValue: token.usdValue
        };
      }
    });
    
    return result;
  }, [balances, tokenSymbol]);

  // Calculate total balance across all networks
  const totalBalance = useMemo(() => {
    return Object.values(allNetworkBalances).reduce((total, { usdValue }) => {
      return total + usdValue;
    }, 0);
  }, [allNetworkBalances]);

  return { 
    balance: tokenBalance.formattedBalance,
    usdValue: tokenBalance.usdValue,
    isLoading: isLoadingBalances,
    error,
    network: currentNetwork,
    // Additional multi-chain data
    allNetworkBalances,
    totalBalance,
    networkTotals
  };
}