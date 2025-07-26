import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { xpsService, XPSStakingInfo, XPSTokenInfo, XPSService } from '@/lib/xpsService';
import { web3Service } from '@/lib/web3';
import { directWeb3Service } from '@/lib/web3-direct';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

// 분리된 컴포넌트들 import
import { StakingPool } from './staking/StakingPool';
import { StakingStats } from './staking/StakingStats';
import { RewardCalculator } from './staking/RewardCalculator';
import { StakingHistory } from './staking/StakingHistory';
import { EmergencyActions } from './staking/EmergencyActions';

export function XPSStakingInterface() {
  const [userAddress, setUserAddress] = useState<string>('');
  const [xpsBalance, setXpsBalance] = useState<string>('0');
  const [stakingInfo, setStakingInfo] = useState<XPSStakingInfo | null>(null);
  const [tokenInfo, setTokenInfo] = useState<XPSTokenInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isWalletSelectorOpen, setIsWalletSelectorOpen] = useState<boolean>(false);
  const { toast } = useToast();

  // Staking analytics data
  const { data: stakingAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/xps/staking-analytics', userAddress],
    enabled: !!userAddress,
    refetchInterval: 30000,
  });

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
      if (!web3Service.provider) {
        console.log('Web3 provider not available');
        return;
      }

      const address = await web3Service.getAccount();
      if (!address) {
        console.log('No wallet connected');
        return;
      }

      setUserAddress(address);
      
      const balance = await web3Service.checkXPSBalance(address);
      setXpsBalance(balance);
      
      const stakingData = await directWeb3Service.getStakingInfoDirect(address);
      
      if (stakingData) {
        const unlockDate = stakingData.unlockTime * 1000;
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
  };  const handleStakeTokens = async (stakeAmount: string, lockPeriod: string) => {
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
      
      const result = await directWeb3Service.stakeXPSDirect(stakeAmount, parseInt(lockPeriod));
      
      if (result.success) {
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
          toast({
            title: "스테이킹 완료! 🎉",
            description: `${stakeAmount} XPS가 성공적으로 ${lockPeriod}일간 스테이킹되었습니다.`,
          });
          
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
        
        try {
          const balance = await web3Service.checkXPSBalance(address);
          setXpsBalance(balance);
        } catch (error) {
          console.error('Failed to load XPS balance:', error);
          setXpsBalance('0');
        }
        
        setTokenInfo({
          totalSupply: '1000000000',
          totalBurned: '0',
          circulatingSupply: '1000000000',
          priceUSD: '1.0',
          marketCap: '1000000000'
        });
        
        const mockStaking: XPSStakingInfo = {
          totalStaked: '0',
          availableRewards: '0.1',
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
  };  const handleClaimRewards = async () => {
    if (!userAddress) {
      toast({
        title: "지갑 연결 필요",
        description: "지갑을 먼저 연결해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!stakingInfo || parseFloat(stakingInfo.availableRewards) <= 0) {
      toast({
        title: "보상 없음",
        description: "클레임 가능한 보상이 없습니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      toast({
        title: "보상 클레임 진행 중",
        description: "XPS 스테이킹 보상을 클레임하고 있습니다. 메타마스크에서 거래를 확인해주세요.",
      });
      
      const result = await directWeb3Service.claimRewardsDirect();
      
      if (result.success) {
        const response = await fetch('/api/xps/claim-rewards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: userAddress,
            rewardAmount: stakingInfo.availableRewards,
            transactionHash: result.transactionHash
          })
        });

        if (response.ok) {
          toast({
            title: "보상 클레임 완료! 🎉",
            description: `${stakingInfo.availableRewards} XPS 보상이 판매자 지갑에서 전송되었습니다.`,
          });
          
          await loadUserData();
        } else {
          const errorData = await response.json();
          toast({
            title: "보상 클레임 기록 실패",
            description: errorData.error || "보상 클레임 기록 저장 중 오류가 발생했습니다.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "보상 클레임 실패",
          description: result.error || "보상 클레임 실행 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Reward claim failed:', error);
      toast({
        title: "보상 클레임 실패",
        description: "다시 시도해주세요.",
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

  const getStakingMultiplier = (lockDays: number) => {
    return XPSService.getStakingMultiplier(lockDays);
  };

  const formatDuration = (seconds: number) => {
    return XPSService.formatStakingDuration(seconds);
  };  return (
    <div className="space-y-6">
      {/* 지갑 연결이 안된 경우 EmergencyActions 컴포넌트 표시 */}
      <EmergencyActions
        userAddress={userAddress}
        loading={loading}
        isWalletSelectorOpen={isWalletSelectorOpen}
        setIsWalletSelectorOpen={setIsWalletSelectorOpen}
        onConnectWallet={handleConnectWallet}
      />

      {/* 지갑이 연결된 경우 스테이킹 인터페이스 표시 */}
      {userAddress && (
        <>
          {/* XPS 토큰 통계 */}
          <StakingStats 
            xpsBalance={xpsBalance}
            stakingInfo={stakingInfo}
          />

          {/* 탭 인터페이스 */}
          <Tabs defaultValue="stake" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="stake">Stake XPS</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* 스테이킹 탭 */}
            <TabsContent value="stake" className="space-y-4">
              <StakingPool
                stakingInfo={stakingInfo}
                xpsBalance={xpsBalance}
                loading={loading}
                onStake={handleStakeTokens}
                onClaimRewards={handleClaimRewards}
                onEmergencyWithdraw={handleEmergencyWithdraw}
                getStakingMultiplier={getStakingMultiplier}
                formatDuration={formatDuration}
              />
            </TabsContent>

            {/* 보상 탭 */}
            <TabsContent value="rewards" className="space-y-4">
              <RewardCalculator
                xpsBalance={xpsBalance}
                stakingInfo={stakingInfo}
              />
            </TabsContent>

            {/* 분석 탭 */}
            <TabsContent value="analytics" className="space-y-4">
              <StakingHistory
                stakingAnalytics={stakingAnalytics}
                analyticsLoading={analyticsLoading}
                userAddress={userAddress}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}