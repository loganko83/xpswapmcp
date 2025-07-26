import { useUniversalTokenBalance } from './useUniversalTokenBalance';

// Legacy hook - redirects to new universal balance hook
export function useTokenBalance(tokenSymbol: string) {
  const { formattedBalance, isLoading, error, network } = useUniversalTokenBalance(tokenSymbol);
  
  return { 
    balance: formattedBalance, 
    isLoading, 
    error,
    network
  };
}