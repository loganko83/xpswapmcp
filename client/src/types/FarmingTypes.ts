export interface Farm {
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

export interface StakeDialogProps {
  farm: Farm;
  isOpen: boolean;
  onClose: () => void;
  action: 'stake' | 'unstake';
}

export interface YieldFarmingManagerProps {
  farms: Farm[];
}

export interface UserFarmData {
  farmId: number;
  totalStaked: string;
  pendingRewards: string;
  poolShare: string;
}

export interface StakeParams {
  farmId: number;
  amount: string;
  lockPeriod?: number;
  userAddress: string;
}

export interface ClaimRewardsResponse {
  rewardAmount: string;
  rewardToken: string;
}

export type StakeAction = 'stake' | 'unstake';

export interface LockPeriodOption {
  days: string;
  label: string;
  bonus: string;
}

export const LOCK_PERIOD_OPTIONS: LockPeriodOption[] = [
  { days: "30", label: "1 Month", bonus: "100%" },
  { days: "90", label: "3 Months", bonus: "150%" },
  { days: "180", label: "6 Months", bonus: "250%" },
  { days: "365", label: "1 Year", bonus: "400%" }
];

export const APY_BY_LOCK_PERIOD: Record<number, number> = {
  30: 100,   // 100% APY for 30 days
  90: 150,   // 150% APY for 90 days  
  180: 250,  // 250% APY for 180 days
  365: 400   // 400% APY for 365 days
};
