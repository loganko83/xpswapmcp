// Farm contract service
import { ethers } from 'ethers';

const FARMING_CONTRACT_ADDRESS = '0x7890123456789012345678901234567890123456'; // 실제 컨트랙트 주소로 교체 필요

const FARMING_ABI = [
  'function getAllPools() view returns (tuple(uint256 id, address lpToken, address rewardToken, uint256 totalStaked, uint256 rewardRate, uint256 periodFinish, bool active)[])',
  'function getPoolInfo(uint256 poolId) view returns (tuple(address lpToken, address rewardToken, uint256 totalStaked, uint256 rewardRate, uint256 periodFinish, bool active))',
  'function earned(address account, uint256 poolId) view returns (uint256)',
  'function balanceOf(address account, uint256 poolId) view returns (uint256)',
];

export class FarmingService {
  private provider: ethers.Provider;
  private contract: ethers.Contract;

  constructor(rpcUrl: string = process.env.XPHERE_RPC_URL || 'https://en-bkk.x-phere.com') {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contract = new ethers.Contract(FARMING_CONTRACT_ADDRESS, FARMING_ABI, this.provider);
  }

  async getAllFarms() {
    try {
      const pools = await this.contract.getAllPools();
      
      // Transform blockchain data to API format
      return pools.map((pool: any, index: number) => ({
        id: index,
        lpToken: pool.lpToken,
        rewardToken: pool.rewardToken,
        totalStaked: ethers.formatEther(pool.totalStaked),
        rewardRate: ethers.formatEther(pool.rewardRate),
        apr: this.calculateAPR(pool.rewardRate, pool.totalStaked),
        active: pool.active,
        periodFinish: new Date(Number(pool.periodFinish) * 1000).toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching farms from blockchain:', error);
      // Return empty array on error
      return [];
    }
  }

  async getFarmDetails(farmId: number) {
    try {
      const pool = await this.contract.getPoolInfo(farmId);
      
      return {
        id: farmId,
        lpToken: pool.lpToken,
        rewardToken: pool.rewardToken,
        totalStaked: ethers.formatEther(pool.totalStaked),
        rewardRate: ethers.formatEther(pool.rewardRate),
        apr: this.calculateAPR(pool.rewardRate, pool.totalStaked),
        active: pool.active,
        periodFinish: new Date(Number(pool.periodFinish) * 1000).toISOString(),
      };
    } catch (error) {
      console.error('Error fetching farm details:', error);
      return null;
    }
  }

  async getUserFarmInfo(userAddress: string, farmId: number) {
    try {
      const [balance, earned] = await Promise.all([
        this.contract.balanceOf(userAddress, farmId),
        this.contract.earned(userAddress, farmId),
      ]);

      return {
        staked: ethers.formatEther(balance),
        earned: ethers.formatEther(earned),
      };
    } catch (error) {
      console.error('Error fetching user farm info:', error);
      return { staked: '0', earned: '0' };
    }
  }

  private calculateAPR(rewardRate: bigint, totalStaked: bigint): string {
    if (totalStaked === 0n) return '0';
    
    // APR = (rewardRate * seconds per year * 100) / totalStaked
    const secondsPerYear = 31536000n;
    const apr = (rewardRate * secondsPerYear * 100n) / totalStaked;
    
    return ethers.formatEther(apr);
  }
}

export const farmingService = new FarmingService();