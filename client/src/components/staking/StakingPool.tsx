import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Zap } from 'lucide-react';
import { XPSStakingInfo } from '@/lib/xpsService';

interface StakingPoolProps {
  stakingInfo: XPSStakingInfo | null;
  xpsBalance: string;
  loading: boolean;
  onStake: (amount: string, lockPeriod: string) => Promise<void>;
  onClaimRewards: () => Promise<void>;
  onEmergencyWithdraw: () => Promise<void>;
  getStakingMultiplier: (lockDays: number) => number;
  formatDuration: (seconds: number) => string;
}

export function StakingPool({ 
  stakingInfo, 
  xpsBalance, 
  loading, 
  onStake, 
  onClaimRewards, 
  onEmergencyWithdraw,
  getStakingMultiplier,
  formatDuration
}: StakingPoolProps) {
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [lockPeriod, setLockPeriod] = useState<string>('30');
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState<boolean>(false);

  const handleStakeTokens = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      return;
    }

    if (parseFloat(stakeAmount) > parseFloat(xpsBalance)) {
      return;
    }

    await onStake(stakeAmount, lockPeriod);
    setStakeAmount('');
    setIsStakeDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-500" />
          Stake XPS Tokens
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stakingInfo && parseFloat(stakingInfo.stakedAmount) > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Staked Amount</Label>
                <p className="text-2xl font-bold">{parseFloat(stakingInfo.stakedAmount).toLocaleString()} XPS</p>
              </div>
              <div>
                <Label>Lock Period</Label>
                <p className="text-lg">{stakingInfo.lockPeriod} days</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Staking Duration</Label>
                <p className="text-lg">{formatDuration(parseInt(stakingInfo.stakingDuration))}</p>
              </div>
              <div>
                <Label>Pending Rewards</Label>
                <p className="text-lg font-semibold text-green-500">{parseFloat(stakingInfo.pendingRewards).toLocaleString()} XPS</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={onClaimRewards} disabled={loading || parseFloat(stakingInfo.pendingRewards) === 0}>
                {loading ? 'Processing...' : 'Claim Rewards'}
              </Button>
              <Button variant="destructive" onClick={onEmergencyWithdraw} disabled={loading}>
                {loading ? 'Processing...' : 'Emergency Withdraw (25% penalty)'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You have no staked XPS tokens</p>
            <Dialog open={isStakeDialogOpen} onOpenChange={setIsStakeDialogOpen}>
              <DialogTrigger asChild>
                <Button>Start Staking</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Stake XPS Tokens</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="stake-amount">Amount to Stake</Label>
                    <Input
                      id="stake-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      max={xpsBalance}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Available: {parseFloat(xpsBalance).toLocaleString()} XPS
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="lock-period">Lock Period</Label>
                    <Select value={lockPeriod} onValueChange={setLockPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lock period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 days (1.0x multiplier)</SelectItem>
                        <SelectItem value="90">90 days (1.5x multiplier)</SelectItem>
                        <SelectItem value="180">180 days (2.5x multiplier)</SelectItem>
                        <SelectItem value="365">365 days (4.0x multiplier)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Staking APY: {(100 * getStakingMultiplier(parseInt(lockPeriod))).toFixed(0)}% 
                      | Emergency withdrawal has 25% penalty
                    </AlertDescription>
                  </Alert>

                  <div className="flex gap-2">
                    <Button onClick={handleStakeTokens} disabled={loading}>
                      {loading ? 'Processing...' : 'Stake Tokens'}
                    </Button>
                    <Button variant="outline" onClick={() => setIsStakeDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}