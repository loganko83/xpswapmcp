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

export interface FarmMetrics {
  totalValueLocked: number;
  totalRewardsDistributed: number;
  activeFarms: number;
  avgAPR: number;
  userTotalStaked: number;
  userTotalRewards: number;
}

export interface StakeDialogProps {
  farm: Farm;
  isOpen: boolean;
  onClose: () => void;
  action: 'stake' | 'unstake';
}

export interface FarmCardProps {
  farm: Farm;
  onStake: (farm: Farm) => void;
  onUnstake: (farm: Farm) => void;
  onHarvest: (farm: Farm) => void;
}

export type SortOption = 'apr' | 'tvl' | 'rewards' | 'multiplier';
export type FilterOption = 'all' | 'active' | 'staked' | 'ended';
