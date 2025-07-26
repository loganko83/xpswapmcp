import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Trophy, Plus, Minus, Coins } from "lucide-react";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { getTokenIcon } from "@/lib/tokenUtils";
import { useFarmingOperations } from "@/hooks/useFarmingOperations";
import { StakeDialog } from "@/components/farming/StakeDialog";
import { 
  Farm, 
  YieldFarmingManagerProps, 
  StakeAction 
} from "@/types/FarmingTypes";

export function YieldFarmingManager({ farms }: YieldFarmingManagerProps) {
  const { wallet } = useWeb3Context();
  const [selectedFarm, setSelectedFarm] = useState<Farm | null>(null);
  const [stakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [stakeAction, setStakeAction] = useState<StakeAction>('stake');

  const { data: tokenPrices } = useTokenPrices(['XP', 'BTC', 'ETH', 'USDT', 'BNB']);
  const { 
    claimRewardsMutation, 
    getUserFarmData, 
    formatCurrency 
  } = useFarmingOperations();

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
            <FarmCard 
              key={farm.id}
              farm={farm}
              onStake={() => handleStake(farm)}
              formatCurrency={formatCurrency}
            />
          ))}
        </TabsContent>

        <TabsContent value="my-farms" className="space-y-4">
          {wallet.isConnected ? (
            userFarms.length > 0 ? (
              userFarms.map((farm) => (
                <UserFarmCard
                  key={farm.id}
                  farm={farm}
                  getUserFarmData={getUserFarmData}
                  onStake={() => handleStake(farm)}
                  onUnstake={() => handleUnstake(farm)}
                  onClaim={() => claimRewardsMutation.mutate(farm.id)}
                  isClaimPending={claimRewardsMutation.isPending}
                />
              ))
            ) : (
              <EmptyFarmsCard onStartFarming={() => {
                if (farms.length > 0) {
                  setSelectedFarm(farms[0]);
                  setStakeAction('stake');
                  setStakeDialogOpen(true);
                }
              }} />
            )
          ) : (
            <ConnectWalletCard />
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

// Farm Card Component
function FarmCard({ 
  farm, 
  onStake, 
  formatCurrency 
}: { 
  farm: Farm; 
  onStake: () => void; 
  formatCurrency: (amount: string) => string;
}) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
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
                onClick={onStake}
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
  );
}

// User Farm Card Component
function UserFarmCard({
  farm,
  getUserFarmData,
  onStake,
  onUnstake,
  onClaim,
  isClaimPending
}: {
  farm: Farm;
  getUserFarmData: (farmId: number) => any;
  onStake: () => void;
  onUnstake: () => void;
  onClaim: () => void;
  isClaimPending: boolean;
}) {
  const userData = getUserFarmData(farm.id);
  
  return (
    <Card className="border-purple-200">
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
                Staked: {userData?.totalStaked || '0.000'} {farm.stakingToken.symbol}
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-semibold text-green-600">
              {userData?.pendingRewards || '0.000'} XPS
            </div>
            <div className="text-sm text-muted-foreground">
              ≈ ${parseFloat(userData?.pendingRewards || '0').toFixed(2)}
            </div>
          </div>
        </div>

        {/* User Position Details */}
        <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <p className="text-sm text-muted-foreground">Staked Amount</p>
            <p className="font-semibold">{userData?.totalStaked || '0.000'} {farm.stakingToken.symbol}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Rewards</p>
            <p className="font-semibold text-green-600">{userData?.pendingRewards || '0.000'} XPS</p>
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
            onClick={onStake}
          >
            <Plus className="w-4 h-4 mr-1" />
            Stake More
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={onUnstake}
          >
            <Minus className="w-4 h-4 mr-1" />
            Unstake
          </Button>
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700"
            onClick={onClaim}
            disabled={parseFloat(userData?.pendingRewards || '0') === 0 || isClaimPending}
          >
            <Coins className="w-4 h-4 mr-1" />
            {isClaimPending ? 'Claiming...' : 'Claim Rewards'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Empty Farms Card Component
function EmptyFarmsCard({ onStartFarming }: { onStartFarming: () => void }) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No active farms</h3>
        <p className="text-muted-foreground mb-4">
          You haven't staked in any farms yet.
        </p>
        <Button onClick={onStartFarming}>Start Farming</Button>
      </CardContent>
    </Card>
  );
}

// Connect Wallet Card Component
function ConnectWalletCard() {
  return (
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
  );
}
