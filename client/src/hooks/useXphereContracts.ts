import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { xphereContract, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { useWeb3 } from "./useWeb3";
import { useToast } from "./use-toast";

export function useXphereContracts() {
  const { wallet } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize contracts when wallet is connected
  useEffect(() => {
    const initContracts = async () => {
      if (wallet.isConnected && !isInitialized) {
        try {
          await xphereContract.initialize();
          setIsInitialized(true);
        } catch (error) {
          console.error("Failed to initialize contracts:", error);
        }
      }
    };

    initContracts();
  }, [wallet.isConnected, isInitialized]);

  // Get real token balance from blockchain
  const useTokenBalance = (tokenSymbol: string) => {
    return useQuery({
      queryKey: ["tokenBalance", wallet.address, tokenSymbol],
      queryFn: async () => {
        if (!wallet.address || !isInitialized) return "0";
        
        const tokenAddress = getTokenAddress(tokenSymbol);
        if (!tokenAddress) return "0";
        
        return await xphereContract.getTokenBalance(tokenAddress, wallet.address);
      },
      enabled: !!wallet.address && isInitialized,
      refetchInterval: 10000, // Refresh every 10 seconds
    });
  };

  // Get token information from blockchain
  const useTokenInfo = (tokenSymbol: string) => {
    return useQuery({
      queryKey: ["tokenInfo", tokenSymbol],
      queryFn: async () => {
        if (!isInitialized) return null;
        
        const tokenAddress = getTokenAddress(tokenSymbol);
        if (!tokenAddress) return null;
        
        return await xphereContract.getTokenInfo(tokenAddress);
      },
      enabled: isInitialized,
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });
  };

  // Get swap quote from router contract
  const useSwapQuote = (tokenIn: string, tokenOut: string, amountIn: string) => {
    return useQuery({
      queryKey: ["swapQuote", tokenIn, tokenOut, amountIn],
      queryFn: async () => {
        if (!isInitialized || !amountIn || parseFloat(amountIn) <= 0) return null;
        
        const tokenInAddress = getTokenAddress(tokenIn);
        const tokenOutAddress = getTokenAddress(tokenOut);
        
        if (!tokenInAddress || !tokenOutAddress) return null;
        
        return await xphereContract.getSwapQuote(tokenInAddress, tokenOutAddress, amountIn);
      },
      enabled: !!amountIn && parseFloat(amountIn) > 0 && isInitialized,
      staleTime: 1000 * 30, // Cache for 30 seconds
    });
  };

  // Get liquidity pool reserves
  const usePairReserves = (tokenA: string, tokenB: string) => {
    return useQuery({
      queryKey: ["pairReserves", tokenA, tokenB],
      queryFn: async () => {
        if (!isInitialized) return null;
        
        const tokenAAddress = getTokenAddress(tokenA);
        const tokenBAddress = getTokenAddress(tokenB);
        
        if (!tokenAAddress || !tokenBAddress) return null;
        
        try {
          return await xphereContract.getPairReserves(tokenAAddress, tokenBAddress);
        } catch (error) {
          console.error("Pair does not exist:", error);
          return null;
        }
      },
      enabled: isInitialized,
      refetchInterval: 15000, // Refresh every 15 seconds
    });
  };

  // Get staked amount for user
  const useStakedAmount = () => {
    return useQuery({
      queryKey: ["stakedAmount", wallet.address],
      queryFn: async () => {
        if (!wallet.address || !isInitialized) return "0";
        return await xphereContract.getStakedAmount(wallet.address);
      },
      enabled: !!wallet.address && isInitialized,
      refetchInterval: 10000,
    });
  };

  // Get pending rewards for user
  const usePendingRewards = () => {
    return useQuery({
      queryKey: ["pendingRewards", wallet.address],
      queryFn: async () => {
        if (!wallet.address || !isInitialized) return "0";
        return await xphereContract.getPendingRewards(wallet.address);
      },
      enabled: !!wallet.address && isInitialized,
      refetchInterval: 5000, // Refresh every 5 seconds for rewards
    });
  };

  // Token approval mutation
  const useTokenApproval = () => {
    return useMutation({
      mutationFn: async ({ tokenSymbol, spenderAddress, amount }: {
        tokenSymbol: string;
        spenderAddress: string;
        amount: string;
      }) => {
        if (!isInitialized) throw new Error("Contracts not initialized");
        
        const tokenAddress = getTokenAddress(tokenSymbol);
        if (!tokenAddress) throw new Error("Token not supported");
        
        return await xphereContract.approveToken(tokenAddress, spenderAddress, amount);
      },
      onSuccess: (txHash) => {
        toast({
          title: "Approval Submitted",
          description: `Transaction hash: ${txHash.slice(0, 10)}...`,
        });
        
        // Invalidate token balance queries
        queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
      },
      onError: (error) => {
        toast({
          title: "Approval Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Swap execution mutation
  const useSwapExecution = () => {
    return useMutation({
      mutationFn: async ({ tokenIn, tokenOut, amountIn, minAmountOut }: {
        tokenIn: string;
        tokenOut: string;
        amountIn: string;
        minAmountOut: string;
      }) => {
        if (!wallet.address || !isInitialized) throw new Error("Wallet not connected");
        
        const tokenInAddress = getTokenAddress(tokenIn);
        const tokenOutAddress = getTokenAddress(tokenOut);
        
        if (!tokenInAddress || !tokenOutAddress) throw new Error("Token not supported");
        
        return await xphereContract.executeSwap(
          tokenInAddress,
          tokenOutAddress,
          amountIn,
          minAmountOut,
          wallet.address
        );
      },
      onSuccess: (txHash) => {
        toast({
          title: "Swap Submitted",
          description: `Transaction hash: ${txHash.slice(0, 10)}...`,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
        queryClient.invalidateQueries({ queryKey: ["pairReserves"] });
      },
      onError: (error) => {
        toast({
          title: "Swap Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Add liquidity mutation
  const useAddLiquidity = () => {
    return useMutation({
      mutationFn: async ({ tokenA, tokenB, amountA, amountB }: {
        tokenA: string;
        tokenB: string;
        amountA: string;
        amountB: string;
      }) => {
        if (!wallet.address || !isInitialized) throw new Error("Wallet not connected");
        
        const tokenAAddress = getTokenAddress(tokenA);
        const tokenBAddress = getTokenAddress(tokenB);
        
        if (!tokenAAddress || !tokenBAddress) throw new Error("Token not supported");
        
        return await xphereContract.addLiquidity(
          tokenAAddress,
          tokenBAddress,
          amountA,
          amountB,
          wallet.address
        );
      },
      onSuccess: (txHash) => {
        toast({
          title: "Liquidity Added",
          description: `Transaction hash: ${txHash.slice(0, 10)}...`,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
        queryClient.invalidateQueries({ queryKey: ["pairReserves"] });
      },
      onError: (error) => {
        toast({
          title: "Add Liquidity Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Remove liquidity mutation
  const useRemoveLiquidity = () => {
    return useMutation({
      mutationFn: async ({ tokenA, tokenB, liquidity }: {
        tokenA: string;
        tokenB: string;
        liquidity: string;
      }) => {
        if (!wallet.address || !isInitialized) throw new Error("Wallet not connected");
        
        const tokenAAddress = getTokenAddress(tokenA);
        const tokenBAddress = getTokenAddress(tokenB);
        
        if (!tokenAAddress || !tokenBAddress) throw new Error("Token not supported");
        
        return await xphereContract.removeLiquidity(
          tokenAAddress,
          tokenBAddress,
          liquidity,
          wallet.address
        );
      },
      onSuccess: (txHash) => {
        toast({
          title: "Liquidity Removed",
          description: `Transaction hash: ${txHash.slice(0, 10)}...`,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
        queryClient.invalidateQueries({ queryKey: ["pairReserves"] });
      },
      onError: (error) => {
        toast({
          title: "Remove Liquidity Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Staking mutation
  const useStaking = () => {
    return useMutation({
      mutationFn: async ({ action, amount }: {
        action: "stake" | "unstake";
        amount: string;
      }) => {
        if (!isInitialized) throw new Error("Contracts not initialized");
        
        if (action === "stake") {
          return await xphereContract.stakeTokens(amount);
        } else {
          return await xphereContract.unstakeTokens(amount);
        }
      },
      onSuccess: (txHash, { action }) => {
        toast({
          title: `${action === "stake" ? "Staking" : "Unstaking"} Submitted`,
          description: `Transaction hash: ${txHash.slice(0, 10)}...`,
        });
        
        // Invalidate staking queries
        queryClient.invalidateQueries({ queryKey: ["stakedAmount"] });
        queryClient.invalidateQueries({ queryKey: ["pendingRewards"] });
        queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
      },
      onError: (error) => {
        toast({
          title: "Staking Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Claim rewards mutation
  const useClaimRewards = () => {
    return useMutation({
      mutationFn: async () => {
        if (!isInitialized) throw new Error("Contracts not initialized");
        return await xphereContract.claimRewards();
      },
      onSuccess: (txHash) => {
        toast({
          title: "Rewards Claimed",
          description: `Transaction hash: ${txHash.slice(0, 10)}...`,
        });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ["pendingRewards"] });
        queryClient.invalidateQueries({ queryKey: ["tokenBalance"] });
      },
      onError: (error) => {
        toast({
          title: "Claim Failed",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Helper function to get token address by symbol
  const getTokenAddress = useCallback((symbol: string): string | null => {
    const tokenMap: { [key: string]: string } = {
      XP: CONTRACT_ADDRESSES.XP_TOKEN,
      USDT: CONTRACT_ADDRESSES.USDT_TOKEN,
      ETH: CONTRACT_ADDRESSES.WETH_TOKEN,
      BTC: CONTRACT_ADDRESSES.WBTC_TOKEN,
      BNB: CONTRACT_ADDRESSES.BNB_TOKEN,
    };
    
    return tokenMap[symbol.toUpperCase()] || null;
  }, []);

  // Transaction monitoring
  const useTransactionStatus = (txHash: string | null) => {
    return useQuery({
      queryKey: ["transactionStatus", txHash],
      queryFn: async () => {
        if (!txHash || !isInitialized) return null;
        
        try {
          const receipt = await xphereContract.getTransactionReceipt(txHash);
          return receipt;
        } catch (error) {
          // Transaction might still be pending
          return null;
        }
      },
      enabled: !!txHash && isInitialized,
      refetchInterval: 3000, // Check every 3 seconds
      retry: false,
    });
  };

  return {
    isInitialized,
    
    // Queries
    useTokenBalance,
    useTokenInfo,
    useSwapQuote,
    usePairReserves,
    useStakedAmount,
    usePendingRewards,
    useTransactionStatus,
    
    // Mutations
    useTokenApproval,
    useSwapExecution,
    useAddLiquidity,
    useRemoveLiquidity,
    useStaking,
    useClaimRewards,
    
    // Utilities
    getTokenAddress,
    contractAddresses: CONTRACT_ADDRESSES,
  };
}