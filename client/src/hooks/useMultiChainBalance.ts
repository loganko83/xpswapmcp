import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWeb3 } from './useWeb3';

export interface MultiChainToken {
  symbol: string;
  name: string;
  network: string;
  balance: string;
  usdValue: number;
  address?: string;
  decimals?: number;
  logoUrl?: string;
}

export interface MultiChainBalance {
  address: string;
  balances: {
    ethereum: Record<string, { balance: string; usdValue: number }>;
    bsc: Record<string, { balance: string; usdValue: number }>;
    xphere: Record<string, { balance: string; usdValue: number }>;
  };
  totalUsdValue: number;
}

export interface MultiChainTransaction {
  hash: string;
  network: string;
  type: 'send' | 'receive' | 'swap' | 'approve';
  token: string;
  amount: string;
  usdValue: number;
  from: string;
  to: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed: string;
  gasFee: string;
}

export function useMultiChainBalance() {
  const { wallet } = useWeb3();

  const { data: balances, isLoading: isLoadingBalances, error: balanceError } = useQuery({
    queryKey: ['/api/multichain/balance', wallet?.address],
    enabled: !!wallet?.address,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: transactions, isLoading: isLoadingTransactions, error: transactionError } = useQuery({
    queryKey: ['/api/multichain/transactions', wallet?.address],
    enabled: !!wallet?.address,
    refetchInterval: 60000, // Refresh every minute
  });

  // Convert balances to structured format with error handling
  const formattedBalances = React.useMemo(() => {
    try {
      if (!balances || typeof balances !== 'object') return {};
      
      const bal = balances as MultiChainBalance;
      if (!bal.balances || typeof bal.balances !== 'object') return {};
      
      return Object.entries(bal.balances).reduce((acc, [network, tokens]) => {
        if (!tokens || typeof tokens !== 'object') return acc;
        
        acc[network] = Object.entries(tokens).map(([symbol, data]) => ({
          symbol,
          name: symbol, // In production, this would be fetched from token metadata
          network,
          balance: data?.balance || '0',
          usdValue: data?.usdValue || 0,
        }));
        return acc;
      }, {} as Record<string, MultiChainToken[]>);
    } catch (error) {
      console.error('Error formatting balances:', error);
      return {};
    }
  }, [balances]);

  // Get total value across all networks
  const totalValue = React.useMemo(() => {
    try {
      return (balances as MultiChainBalance)?.totalUsdValue || 0;
    } catch (error) {
      console.error('Error calculating total value:', error);
      return 0;
    }
  }, [balances]);

  // Get network totals
  const networkTotals = React.useMemo(() => {
    try {
      if (!balances || typeof balances !== 'object') return {};
      
      const bal = balances as MultiChainBalance;
      if (!bal.balances || typeof bal.balances !== 'object') return {};
      
      return Object.entries(bal.balances).reduce((acc, [network, tokens]) => {
        if (!tokens || typeof tokens !== 'object') return acc;
        
        acc[network] = Object.values(tokens).reduce((total, token) => {
          return total + (token?.usdValue || 0);
        }, 0);
        return acc;
      }, {} as Record<string, number>);
    } catch (error) {
      console.error('Error calculating network totals:', error);
      return {};
    }
  }, [balances]);

  // Get top tokens by value
  const topTokens = React.useMemo(() => {
    try {
      return Object.values(formattedBalances).flat()
        .sort((a, b) => b.usdValue - a.usdValue)
        .slice(0, 10);
    } catch (error) {
      console.error('Error sorting top tokens:', error);
      return [];
    }
  }, [formattedBalances]);

  return {
    balances: formattedBalances,
    totalValue,
    networkTotals,
    topTokens,
    transactions: (transactions as any)?.transactions || [],
    isLoadingBalances,
    isLoadingTransactions,
    error: balanceError || transactionError,
    refetch: () => {
      // This would trigger a refetch of the data
    }
  };
}

export function useMultiChainTokens() {
  const { wallet } = useWeb3();

  // Get supported tokens across all networks
  const supportedTokens = {
    ethereum: [
      { symbol: 'ETH', name: 'Ethereum', decimals: 18, address: '0x0000000000000000000000000000000000000000' },
      { symbol: 'USDT', name: 'Tether USD', decimals: 6, address: '0xdAC17F958D2ee523a2206206994597C13D831ec7' },
      { symbol: 'USDC', name: 'USD Coin', decimals: 6, address: '0xA0b86a33E6441b1a5e06d5eA4Bb27d6d6E5C1Bcc' },
      { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8, address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' },
      { symbol: 'UNI', name: 'Uniswap', decimals: 18, address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984' },
      { symbol: 'LINK', name: 'Chainlink', decimals: 18, address: '0x514910771AF9Ca656af840dff83E8264EcF986CA' },
    ],
    bsc: [
      { symbol: 'BNB', name: 'Binance Coin', decimals: 18, address: '0x0000000000000000000000000000000000000000' },
      { symbol: 'BUSD', name: 'Binance USD', decimals: 18, address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56' },
      { symbol: 'CAKE', name: 'PancakeSwap', decimals: 18, address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82' },
      { symbol: 'WBNB', name: 'Wrapped BNB', decimals: 18, address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
      { symbol: 'DOGE', name: 'Dogecoin', decimals: 8, address: '0xbA2aE424d960c26247Dd6c32edC70B295c744C43' },
    ],
    xphere: [
      { symbol: 'XP', name: 'Xphere', decimals: 18, address: '0x0000000000000000000000000000000000000000' },
      { symbol: 'ml', name: 'Miracle', decimals: 18, address: '0x1111111111111111111111111111111111111111' },
      { symbol: 'XCR', name: 'Xphere Credit', decimals: 18, address: '0x2222222222222222222222222222222222222222' },
      { symbol: 'XEF', name: 'Xphere Energy', decimals: 18, address: '0x3333333333333333333333333333333333333333' },
      { symbol: 'WARP', name: 'Warp Token', decimals: 18, address: '0x4444444444444444444444444444444444444444' },
    ],
  };

  const { data: balances } = useQuery({
    queryKey: ['/api/multichain/balance', wallet?.address],
    enabled: !!wallet?.address,
  });

  // Add balance information to tokens
  const tokensWithBalance = Object.entries(supportedTokens).reduce((acc, [network, tokens]) => {
    const networkBalances = (balances as MultiChainBalance)?.balances?.[network as keyof typeof supportedTokens] || {};
    acc[network] = tokens.map(token => ({
      ...token,
      balance: networkBalances[token.symbol]?.balance || '0',
      usdValue: networkBalances[token.symbol]?.usdValue || 0,
    }));
    return acc;
  }, {} as Record<string, (typeof supportedTokens.ethereum[0] & { balance: string; usdValue: number })[]>);

  return {
    supportedTokens: tokensWithBalance,
    isLoading: !balances,
  };
}