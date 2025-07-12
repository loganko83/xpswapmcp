import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, TrendingUp, Calendar, Award, Zap, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { xpsService, XPSStakingInfo, XPSTokenInfo, XPSService } from '@/lib/xpsService';
import { web3Service } from '@/lib/web3';
import { useToast } from '@/hooks/use-toast';

export function XPSStakingInterface() {
  const [userAddress, setUserAddress] = useState<string>('');
  const [xpsBalance, setXpsBalance] = useState<string>('0');
  const [stakingInfo, setStakingInfo] = useState<XPSStakingInfo | null>(null);
  const [tokenInfo, setTokenInfo] = useState<XPSTokenInfo | null>(null);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [lockPeriod, setLockPeriod] = useState<string>('30');
  const [loading, setLoading] = useState<boolean>(false);
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState<boolean>(false);
  const { toast } = useToast();

  // Initialize services and load data
  useEffect(() => {
    initializeServices();
  }, []);

  const initializeServices = async () => {
    try {
      if (web3Service.provider) {
        await xpsService.initialize(web3Service.provider);
        await loadUserData();
        await loadTokenInfo();
      }
    } catch (error) {
      console.error('Failed to initialize XPS services:', error);
    }
  };

  const loadUserData = async () => {
    try {
      // Check if wallet is connected
      if (!web3Service.provider) {
        console.log('Web3 provider not available');
        return;
      }

      // Get connected address
      const address = await web3Service.getAccount();
      if (!address) {
        console.log('No wallet connected');
        return;
      }

      setUserAddress(address);
      
      // Load XPS balance
      const balance = await web3Service.checkXPSBalance(address);
      setXpsBalance(balance);
      
      // Load real staking info from smart contract
      const stakingData = await web3Service.getStakingInfo(address);
      
      if (stakingData) {
        const unlockDate = stakingData.unlockTime * 1000; // Convert to milliseconds
        const apy = stakingData.lockPeriod >= 365 ? 400 : 
                   stakingData.lockPeriod >= 180 ? 250 :
                   stakingData.lockPeriod >= 90 ? 150 : 100;
        
        const stakingInfo: XPSStakingInfo = {
          totalStaked: stakingData.stakedAmount,
          availableRewards: stakingData.rewards,
          lockPeriod: stakingData.lockPeriod,
          unlockDate: unlockDate,
          apy: apy,
          multiplier: stakingData.lockPeriod >= 365 ? 4.0 : 
                     stakingData.lockPeriod >= 180 ? 2.5 :
                     stakingData.lockPeriod >= 90 ? 1.5 : 1.0
        };
        setStakingInfo(stakingInfo);
      } else {
        // Default staking info if no staking data found
        const defaultStaking: XPSStakingInfo = {
          totalStaked: '0',
          availableRewards: '0',
          lockPeriod: 30,
          unlockDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          apy: 100,
          multiplier: 1.0
        };
        setStakingInfo(defaultStaking);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadTokenInfo = async () => {
    try {
      const info = await xpsService.getTokenInfo();
      setTokenInfo(info);
    } catch (error) {
      console.error('Failed to load token info:', error);
    }
  };

  const handleStakeTokens = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "오류",
        description: "유효한 스테이킹 수량을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!userAddress) {
      toast({
        title: "지갑 연결 필요",
        description: "지갑을 먼저 연결해주세요.",
        variant: "destructive",
      });
      return;
    }

    const stakeAmountNum = parseFloat(stakeAmount);
    const xpsBalanceNum = parseFloat(xpsBalance);

    if (stakeAmountNum > xpsBalanceNum) {
      toast({
        title: "잔액 부족",
        description: "XPS 토큰 잔액이 부족합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      toast({
        title: "스테이킹 진행 중",
        description: "XPS 토큰 스테이킹이 진행 중입니다. 메타마스크에서 거래를 확인해주세요.",
      });
      
      // 실제 스테이킹 실행
      const result = await web3Service.stakeXPS(stakeAmount, parseInt(lockPeriod));
      
      if (result.success) {
        // 백엔드에 스테이킹 기록 저장
        const response = await fetch('/api/xps/stake', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: userAddress,
            amount: stakeAmount,
            lockPeriod: parseInt(lockPeriod),
            transactionHash: result.transactionHash
          })
        });

        if (response.ok) {
          const data = await response.json();
          toast({
            title: "스테이킹 완료! 🎉",
            description: `${stakeAmount} XPS가 성공적으로 ${lockPeriod}일간 스테이킹되었습니다.`,
          });
          
          // Reset form
          setStakeAmount('');
          setIsStakeDialogOpen(false);
          
          // Reload user data
          await loadUserData();
        } else {
          const errorData = await response.json();
          toast({
            title: "스테이킹 기록 실패",
            description: errorData.error || "스테이킹 기록 저장 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "스테이킹 실패",
          description: result.error || "스테이킹 실행 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Staking failed:', error);
      toast({
        title: "스테이킹 실패",
        description: "다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectWallet = async () => {
    try {
      setLoading(true);
      const address = await web3Service.connectWallet();
      
      if (address) {
        setUserAddress(address);
        
        // Load XPS balance with fallback
        try {
          const balance = await web3Service.checkXPSBalance(address);
          setXpsBalance(balance);
        } catch (error) {
          console.error('Failed to load XPS balance:', error);
          setXpsBalance('0');
        }
        
        // Set default token info
        setTokenInfo({
          totalSupply: '1000000000',
          totalBurned: '0',
          circulatingSupply: '1000000000',
          priceUSD: '1.0',
          marketCap: '1000000000'
        });
        
        // Set default staking info
        const mockStaking: XPSStakingInfo = {
          totalStaked: '0',
          availableRewards: '0',
          lockPeriod: 30,
          unlockDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
          apy: 100,
          multiplier: 1.0
        };
        setStakingInfo(mockStaking);
        
        toast({
          title: "지갑 연결 완료",
          description: "지갑이 성공적으로 연결되었습니다.",
        });
      }
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast({
        title: "지갑 연결 실패",
        description: "지갑 연결을 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const mockHandleStakeTokens = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount.",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(stakeAmount) > parseFloat(xpsBalance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough XPS tokens to stake.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const txHash = await xpsService.stakeTokens(stakeAmount, parseInt(lockPeriod));
      
      toast({
        title: "Staking Successful!",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });
      
      setIsStakeDialogOpen(false);
      setStakeAmount('');
      await loadUserData();
      
    } catch (error) {
      console.error('Staking failed:', error);
      toast({
        title: "Staking Failed",
        description: "Please try again or check your wallet connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async () => {
    setLoading(true);
    try {
      const txHash = await xpsService.claimStakingRewards();
      
      toast({
        title: "Rewards Claimed!",
        description: `Transaction hash: ${txHash.slice(0, 10)}...`,
      });
      
      await loadUserData();
      
    } catch (error) {
      console.error('Claim failed:', error);
      toast({
        title: "Claim Failed",
        description: "Please try again or check your wallet connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyWithdraw = async () => {
    setLoading(true);
    try {
      const txHash = await xpsService.emergencyWithdraw();
      
      toast({
        title: "Emergency Withdrawal Processed",
        description: `Transaction hash: ${txHash.slice(0, 10)}... (25% penalty applied)`,
        variant: "destructive",
      });
      
      await loadUserData();
      
    } catch (error) {
      console.error('Emergency withdraw failed:', error);
      toast({
        title: "Emergency Withdrawal Failed",
        description: "Please try again or check your wallet connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFeeDiscountTier = (balance: number) => {
    const totalBalance = balance + parseFloat(stakingInfo?.stakedAmount || '0');
    return XPSService.getFeeDiscountTier(totalBalance);
  };

  const getStakingMultiplier = (lockDays: number) => {
    return XPSService.getStakingMultiplier(lockDays);
  };

  const formatDuration = (seconds: number) => {
    return XPSService.formatStakingDuration(seconds);
  };

  const tier = getFeeDiscountTier(parseFloat(xpsBalance));

  return (
    <div className="space-y-6">
      {/* Wallet Connection Check */}
      {!userAddress ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Connect Your Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Connect your wallet to start staking XPS tokens
            </p>
            <Button onClick={handleConnectWallet} disabled={loading}>
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* XPS Token Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                XPS Token Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                  <p className="text-lg font-semibold">1,000,000,000 XPS</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Burned</p>
                  <p className="text-lg font-semibold text-red-500">0 XPS</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Your Balance</p>
                  <p className="text-lg font-semibold text-green-500">{parseFloat(xpsBalance).toLocaleString()} XPS</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Fee Discount</p>
                  <Badge variant={tier.discount > 0 ? "default" : "secondary"}>
                    {tier.tier} - {XPSService.formatFeeDiscount(tier.discount)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {userAddress && (
        <Tabs defaultValue="stake" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stake">Stake XPS</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Staking Tab */}
          <TabsContent value="stake" className="space-y-4">
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
                    <Button onClick={handleClaimRewards} disabled={loading || parseFloat(stakingInfo.pendingRewards) === 0}>
                      {loading ? 'Processing...' : 'Claim Rewards'}
                    </Button>
                    <Button variant="destructive" onClick={handleEmergencyWithdraw} disabled={loading}>
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
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Fee Discount Tiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { tier: 'Basic', amount: 1000, discount: 10 },
                  { tier: 'Bronze', amount: 5000, discount: 20 },
                  { tier: 'Silver', amount: 10000, discount: 30 },
                  { tier: 'Gold', amount: 50000, discount: 50 },
                  { tier: 'Platinum', amount: 100000, discount: 75 }
                ].map((tierData) => {
                  const userBalance = parseFloat(xpsBalance) + parseFloat(stakingInfo?.stakedAmount || '0');
                  const isCurrentTier = userBalance >= tierData.amount && 
                    (tierData.tier === 'Platinum' || userBalance < ([5000, 10000, 50000, 100000][['Bronze', 'Silver', 'Gold', 'Platinum'].indexOf(tierData.tier)] || Infinity));
                  
                  return (
                    <div key={tierData.tier} className={`flex items-center justify-between p-3 rounded-lg border ${isCurrentTier ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-3">
                        <Badge variant={isCurrentTier ? "default" : "secondary"}>
                          {tierData.tier}
                        </Badge>
                        <div>
                          <p className="font-medium">{tierData.amount.toLocaleString()} XPS</p>
                          <p className="text-sm text-muted-foreground">{tierData.discount}% fee discount</p>
                        </div>
                      </div>
                      {isCurrentTier && (
                        <Badge variant="default">Current</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-500" />
                  Your XPS Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Wallet Balance</span>
                    <span className="font-semibold">{parseFloat(xpsBalance).toLocaleString()} XPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Staked Amount</span>
                    <span className="font-semibold">{stakingInfo ? parseFloat(stakingInfo.stakedAmount).toLocaleString() : '0'} XPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Holdings</span>
                    <span className="font-semibold text-green-500">
                      {(parseFloat(xpsBalance) + parseFloat(stakingInfo?.stakedAmount || '0')).toLocaleString()} XPS
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Current Discount</span>
                    <span className="font-semibold text-blue-500">{XPSService.formatFeeDiscount(tier.discount)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Staking Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stakingInfo && parseFloat(stakingInfo.stakedAmount) > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Lock Period Progress</span>
                        <span>{Math.min(100, (parseInt(stakingInfo.stakingDuration) / (parseInt(stakingInfo.lockPeriod) * 86400)) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={Math.min(100, (parseInt(stakingInfo.stakingDuration) / (parseInt(stakingInfo.lockPeriod) * 86400)) * 100)} />
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Remaining: {Math.max(0, (parseInt(stakingInfo.lockPeriod) * 86400) - parseInt(stakingInfo.stakingDuration))} seconds</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No active staking</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        </Tabs>
      )}
    </div>
  );
}