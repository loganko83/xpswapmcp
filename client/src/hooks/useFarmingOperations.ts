import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/hooks/useWeb3";
import { StakeParams, ClaimRewardsResponse, Farm, UserFarmData, APY_BY_LOCK_PERIOD } from "@/types/FarmingTypes";

export function useFarmingOperations() {
  const { wallet } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Stake/Unstake tokens mutation
  const stakeMutation = useMutation({
    mutationFn: async (params: StakeParams & { action: 'stake' | 'unstake' }) => {
      if (!wallet.address) {
        throw new Error("Wallet not connected");
      }
      
      const endpoint = params.action === 'stake' ? '/api/stake-tokens' : '/api/unstake-tokens';
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: params.farmId,
          amount: params.amount,
          lockPeriod: params.action === 'stake' ? params.lockPeriod : undefined,
          userAddress: params.userAddress
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${params.action} tokens`);
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      const action = variables.action;
      toast({
        title: `${action === 'stake' ? 'Staking' : 'Unstaking'} Successful`,
        description: `Successfully ${action === 'stake' ? 'staked' : 'unstaked'} ${variables.amount} tokens`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/farms"] });
    },
    onError: (error, variables) => {
      const action = variables.action;
      toast({
        title: `${action === 'stake' ? 'Staking' : 'Unstaking'} Failed`,
        description: `Failed to ${action} tokens. Please try again.`,
        variant: "destructive",
      });
    }
  });

  // Claim rewards mutation
  const claimRewardsMutation = useMutation({
    mutationFn: async (farmId: number): Promise<ClaimRewardsResponse> => {
      const response = await fetch("/api/claim-rewards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId,
          userAddress: wallet.address
        })
      });
      
      if (!response.ok) throw new Error("Failed to claim rewards");
      return response.json();
    },
    onSuccess: (data, farmId) => {
      toast({
        title: "Rewards Claimed",
        description: `Successfully claimed ${data.rewardAmount} ${data.rewardToken}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/farms"] });
    },
    onError: (error) => {
      toast({
        title: "Claim Failed",
        description: "Failed to claim rewards. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Fetch user-specific farm data
  const { data: userFarmData } = useQuery({
    queryKey: ["/api/farms", wallet.address],
    queryFn: async (): Promise<UserFarmData[] | null> => {
      if (!wallet.address) return null;
      
      const response = await fetch(`/api/farms/user-data/${wallet.address}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!wallet.address,
  });

  // Get user data for specific farm
  const getUserFarmData = (farmId: number): UserFarmData | undefined => {
    return userFarmData?.find((data) => data.farmId === farmId);
  };

  // Utility functions
  const calculateAPRBonus = (days: number): string => {
    return (APY_BY_LOCK_PERIOD[days] || 100).toFixed(0);
  };

  const calculateEstimatedRewards = (stakeAmount: string, days: number): string => {
    if (!stakeAmount || parseFloat(stakeAmount) === 0) return "0";
    
    const principal = parseFloat(stakeAmount);
    const apy = parseFloat(calculateAPRBonus(days)) / 100;
    const timeRatio = days / 365;
    
    return (principal * apy * timeRatio).toFixed(4);
  };

  const formatCurrency = (amount: string): string => {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  const calculateRewardsValue = (farm: Farm, tokenPrices: any): string => {
    const rewardPrice = tokenPrices?.[farm.rewardToken.symbol]?.price || 0;
    const rewardAmount = parseFloat(farm.userRewards);
    return (rewardAmount * rewardPrice).toFixed(2);
  };

  return {
    stakeMutation,
    claimRewardsMutation,
    userFarmData,
    getUserFarmData,
    calculateAPRBonus,
    calculateEstimatedRewards,
    formatCurrency,
    calculateRewardsValue
  };
}
