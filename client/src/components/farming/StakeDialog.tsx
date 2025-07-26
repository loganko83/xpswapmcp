import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useWeb3Context } from "@/contexts/Web3Context";
import { useTokenPrices } from "@/hooks/useTokenPrices";
import { useQuery } from "@tanstack/react-query";
import { getTokenIcon } from "@/lib/tokenUtils";
import { useFarmingOperations } from "@/hooks/useFarmingOperations";
import { StakeDialogProps, LOCK_PERIOD_OPTIONS } from "@/types/FarmingTypes";

export function StakeDialog({ farm, isOpen, onClose, action }: StakeDialogProps) {
  const { wallet } = useWeb3Context();
  const [amount, setAmount] = useState("");
  const [lockPeriod, setLockPeriod] = useState("30");

  const { stakeMutation, calculateAPRBonus, calculateEstimatedRewards } = useFarmingOperations();
  const { data: tokenPrices } = useTokenPrices([farm.stakingToken.symbol, farm.rewardToken.symbol]);

  // Real-time token balance for staking
  const { data: stakingTokenBalance } = useQuery({
    queryKey: [`/api/blockchain/balance/${wallet.address}/${farm.stakingToken.symbol}`, wallet.address, farm.stakingToken.symbol],
    enabled: !!wallet.address && !!farm.stakingToken.symbol,
    refetchInterval: 5000,
  });

  const stakingPrice = tokenPrices?.[farm.stakingToken.symbol]?.price || 0;
  const dollarValue = amount ? (parseFloat(amount) * stakingPrice).toFixed(2) : "0.00";

  const handleStake = () => {
    if (!wallet.address) return;
    
    stakeMutation.mutate({
      action,
      farmId: farm.id,
      amount,
      lockPeriod: action === 'stake' ? parseInt(lockPeriod) : undefined,
      userAddress: wallet.address
    });
  };

  const handleMaxClick = () => {
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
                    onClick={handleMaxClick}
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
                {LOCK_PERIOD_OPTIONS.map((option) => (
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
            onClick={handleStake}
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
