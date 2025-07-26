import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Trophy, Clock, DollarSign, TrendingUp, Plus, Minus, Coins } from "lucide-react";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getTokenIcon } from "@/lib/tokenUtils";

interface Farm {
  id: number;
  name: string;
  stakingToken: { symbol: string; name: string; address: string };
  rewardToken: { symbol: string; name: string; address: string };
  apr: string;
  tvl: string;
  multiplier: string;
  lockPeriod: number; // days
  userStaked: string;
  userRewards: string;
  totalStaked: string;
  rewardPerBlock: string;
  startBlock: number;
  endBlock: number;
  isActive: boolean;
  poolWeight: number;
}

interface StakeDialogProps {
  farm: Farm;
  isOpen: boolean;
  onClose: () => void;
  action: 'stake' | 'unstake';
}

function StakeDialog({ farm, isOpen, onClose, action }: StakeDialogProps) {
  const { wallet } = useWeb3Context();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [lockPeriod, setLockPeriod] = useState("30");

  const { data: tokenPrices } = useTokenPrices([farm.stakingToken.symbol, farm.rewardToken.symbol]);

  // Real-time token balance for staking
  const { data: stakingTokenBalance } = useQuery({
    queryKey: [`/api/blockchain/balance/${wallet.address}/${farm.stakingToken.symbol}`, wallet.address, farm.stakingToken.symbol],
    enabled: !!wallet.address && !!farm.stakingToken.symbol,
    refetchInterval: 5000,
  });

  const stakeMutation = useMutation({
    mutationFn: async () => {
      if (!wallet.address) {
        throw new Error("Wallet not connected");
      }
      
      const endpoint = action === 'stake' ? '/api/stake-tokens' : '/api/unstake-tokens';
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: farm.id,
          amount,
          lockPeriod: action === 'stake' ? parseInt(lockPeriod) : undefined,
          userAddress: wallet.address
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${action} tokens`);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: `${action === 'stake' ? 'Staking' : 'Unstaking'} Successful`,
        description: `Successfully ${action === 'stake' ? 'staked' : 'unstaked'} ${amount} ${farm.stakingToken.symbol}`,
      });
      setAmount("");
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/farms"] });
    },
    onError: (error) => {
      toast({
        title: `${action === 'stake' ? 'Staking' : 'Unstaking'} Failed`,
        description: `Failed to ${action} tokens. Please try again.`,
        variant: "destructive",
      });
    }
  });

  const stakingPrice = tokenPrices?.[farm.stakingToken.symbol]?.price || 0;
  const dollarValue = amount ? (parseFloat(amount) * stakingPrice).toFixed(2) : "0.00";

  const calculateAPRBonus = (days: number) => {
    // Real APY calculation based on lock periods (matching backend)
    const apyByLockPeriod = {
      30: 100,   // 100% APY for 30 days
      90: 150,   // 150% APY for 90 days  
      180: 250,  // 250% APY for 180 days
      365: 400   // 400% APY for 365 days
    };
    
    return (apyByLockPeriod[days] || 100).toFixed(0);
  };

  const calculateEstimatedRewards = (stakeAmount: string, days: number) => {
    if (!stakeAmount || parseFloat(stakeAmount) === 0) return "0";
    
    const principal = parseFloat(stakeAmount);
    const apy = parseFloat(calculateAPRBonus(days)) / 100;
    const timeRatio = days / 365;
    
    return (principal * apy * timeRatio).toFixed(4);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {action === 'stake' ? 'Stake' : 'Unstake'} {farm.stakingToken.symbol}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Amount</span>
              <span>
                Available: {action === 'stake' ? 
                  (stakingTokenBalance?.balance || '0.000') : 
                  farm.userStaked} {farm.stakingToken.symbol}
              </span>
            </div>
            <div className="rounded-lg border p-3">
              <div className="flex justify-between items-center mb-2">
                <Input
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="border-0 text-xl font-semibold p-0 h-auto"
                  type="number"
                />
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      if (action === 'stake') {
                        const balance = stakingTokenBalance?.balance || '0';
                        // Leave some tokens for gas fees if it's XP
                        if (farm.stakingToken.symbol === 'XP') {
                          const maxAmount = Math.max(0, parseFloat(balance) - 0.01).toFixed(6);
                          setAmount(maxAmount);
                        } else {
                          setAmount(balance);
                        }
                      } else {
                        setAmount(farm.userStaked);
                      }
                    }}
                  >
                    MAX
                  </Button>
                  <img 
                    src={getTokenIcon(farm.stakingToken.symbol)} 
                    alt={farm.stakingToken.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="font-semibold">{farm.stakingToken.symbol}</span>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">${dollarValue}</div>
            </div>
          </div>

          {/* Lock Period Selection (only for staking) */}
          {action === 'stake' && (
            <div className="space-y-3">
              <label className="text-sm font-medium">Lock Period</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { days: "30", label: "1 Month", bonus: "100%" },
                  { days: "90", label: "3 Months", bonus: "150%" },
                  { days: "180", label: "6 Months", bonus: "250%" },
                  { days: "365", label: "1 Year", bonus: "400%" }
                ].map((option) => (
                  <Button
                    key={option.days}
                    variant={lockPeriod === option.days ? "default" : "outline"}
                    size="sm"
                    className="h-auto p-3 flex flex-col items-center"
                    onClick={() => setLockPeriod(option.days)}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-green-600">{option.bonus}</div>
                  </Button>
                ))}
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <div className="flex justify-between text-sm">
                  <span>Lock Period</span>
                  <span>{lockPeriod} days</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>APY</span>
                  <span className="text-green-600">{calculateAPRBonus(parseInt(lockPeriod))}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estimated Rewards</span>
                  <span className="text-green-600">{calculateEstimatedRewards(amount, parseInt(lockPeriod))} {farm.rewardToken.symbol}</span>
                </div>
              </div>
            </div>
          )}

          {/* Staking Information */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Pool TVL</span>
              <span>{farm.tvl}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total Staked</span>
              <span>{farm.totalStaked}</span>
            </div>
            {action === 'stake' && (
              <div className="flex justify-between text-sm">
                <span>Your Staked</span>
                <span>{farm.userStaked} {farm.stakingToken.symbol}</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button 
            className="w-full" 
            onClick={() => stakeMutation.mutate()}
            disabled={!amount || stakeMutation.isPending}
            variant={action === 'unstake' ? 'destructive' : 'default'}
          >
            {stakeMutation.isPending 
              ? `${action === 'stake' ? 'Staking' : 'Unstaking'}...` 
              : `${action === 'stake' ? 'Stake' : 'Unstake'} ${farm.stakingToken.symbol}`
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface YieldFarmingManagerProps {
  farms: Farm[];
}

export function YieldFarmingManager({ farms }: YieldFarmingManagerProps) {
  const { wallet } = useWeb3Context();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [stakeAction, setStakeAction] = useState<'stake' | 'unstake'>('stake');

  const { data: tokenPrices } = useTokenPrices(['XP', 'BTC', 'ETH', 'USDT', 'BNB']);

  const claimRewardsMutation = useMutation({
    mutationFn: async (farmId: number) => {
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

  const handleStake = (farm: Farm) => {
    setSelectedFarm(farm);
    setStakeAction('stake');
    setStakeDialogOpen(true);
  };

  const handleUnstake = (farm: Farm) => {
    setSelectedFarm(farm);
    setStakeAction('unstake');
    setStakeDialogOpen(true);
  };

  // Fetch user-specific farm data
  const { data: userFarmData } = useQuery({
    queryKey: ["/api/farms", wallet.address],
    queryFn: async () => {
      if (!wallet.address) return null;
      
      const farmDataPromises = farms.map(async (farm) => {
        const response = await fetch(`/api/farms/${farm.id}/user-info/${wallet.address}`);
        if (!response.ok) return null;
        return response.json();
      });
      
      const results = await Promise.all(farmDataPromises);
      return results.filter(Boolean);
    },
    enabled: !!wallet.address && farms.length > 0,
  });



  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount.replace(/,/g, ''));
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `$${(num / 1000).toFixed(0)}K`;
    }
    return `$${num.toLocaleString()}`;
  };

  // Get user data for specific farm
  const getUserFarmData = (farmId: number) => {
    return userFarmData?.find((data: any) => data.farmId === farmId);
  };

  const calculateRewardsValue = (farm: Farm) => {
    const rewardPrice = tokenPrices?.[farm.rewardToken.symbol]?.price || 0;
    const rewardAmount = parseFloat(farm.userRewards);
    return (rewardAmount * rewardPrice).toFixed(2);
  };

  const userFarms = farms.filter(farm => {
    const userData = getUserFarmData(farm.id);
    return userData && parseFloat(userData.totalStaked) > 0;
  });
  const availableFarms = farms.filter(farm => farm.isActive);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active-farms" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active-farms">All Farms</TabsTrigger>
          <TabsTrigger value="my-farms">My Farms</TabsTrigger>
        </TabsList>

        <TabsContent value="active-farms" className="space-y-4">
          {availableFarms.map((farm) => (
            <Card key={farm.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center -space-x-2">
                      <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                        <img 
                          src={getTokenIcon(farm.stakingToken.symbol)} 
                          alt={farm.stakingToken.symbol}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{farm.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Stake {farm.stakingToken.symbol} • Earn {farm.rewardToken.symbol}
                      </p>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {farm.multiplier}x
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-8 text-right">
                    <div>
                      <p className="text-sm text-muted-foreground">APY</p>
                      <Badge variant="secondary" className="text-green-600 text-lg">
                        100%-400%
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">TVL</p>
                      <p className="font-semibold">{formatCurrency(farm.tvl)}</p>
                    </div>
                    <div className="space-x-2">
                      <Button 
                        size="sm" 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleStake(farm)}
                      >
                        <Zap className="w-4 h-4 mr-1" />
                        Stake
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Farm Details */}
                <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Reward per Block</p>
                    <p className="font-medium">{farm.rewardPerBlock} {farm.rewardToken.symbol}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lock Period</p>
                    <p className="font-medium">{farm.lockPeriod} days min</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pool Weight</p>
                    <p className="font-medium">{farm.poolWeight}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge variant={farm.isActive ? "default" : "secondary"}>
                      {farm.isActive ? "Active" : "Ended"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="my-farms" className="space-y-4">
          {wallet.isConnected ? (
            userFarms.length > 0 ? (
              userFarms.map((farm) => (
                <Card key={farm.id} className="border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center -space-x-2">
                          <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden">
                            <img 
                              src={getTokenIcon(farm.stakingToken.symbol)} 
                              alt={farm.stakingToken.symbol}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="w-8 h-8 rounded-full border-2 border-background overflow-hidden bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                            <Trophy className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{farm.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Staked: {getUserFarmData(farm.id)?.totalStaked || '0.000'} {farm.stakingToken.symbol}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">
                          {getUserFarmData(farm.id)?.pendingRewards || '0.000'} XPS
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ≈ ${parseFloat(getUserFarmData(farm.id)?.pendingRewards || '0').toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* User Position Details */}
                    <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <p className="text-sm text-muted-foreground">Staked Amount</p>
                        <p className="font-semibold">{getUserFarmData(farm.id)?.totalStaked || '0.000'} {farm.stakingToken.symbol}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Rewards</p>
                        <p className="font-semibold text-green-600">{getUserFarmData(farm.id)?.pendingRewards || '0.000'} XPS</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">APY</p>
                        <Badge variant="secondary" className="text-green-600">100%-400%</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pool Share</p>
                        <p className="font-semibold">0.05%</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStake(farm)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Stake More
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUnstake(farm)}
                      >
                        <Minus className="w-4 h-4 mr-1" />
                        Unstake
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => claimRewardsMutation.mutate(farm.id)}
                        disabled={parseFloat(getUserFarmData(farm.id)?.pendingRewards || '0') === 0 || claimRewardsMutation.isPending}
                      >
                        <Coins className="w-4 h-4 mr-1" />
                        {claimRewardsMutation.isPending ? 'Claiming...' : 'Claim Rewards'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No active farms</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't staked in any farms yet.
                  </p>
                  <Button onClick={() => {
                    if (farms.length > 0) {
                      setSelectedFarm(farms[0]);
                      setStakeAction('stake');
                      setStakeDialogOpen(true);
                    }
                  }}>Start Farming</Button>
                </CardContent>
              </Card>
            )
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Connect your wallet</h3>
                <p className="text-muted-foreground">
                  Connect your wallet to view your farming positions.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Stake/Unstake Dialog */}
      {selectedFarm && (
        <StakeDialog
          farm={selectedFarm}
          isOpen={stakeDialogOpen}
          onClose={() => {
            setStakeDialogOpen(false);
            setSelectedFarm(null);
          }}
          action={stakeAction}
        />
      )}
    </div>
  );
}