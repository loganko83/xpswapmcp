import { ethers, BrowserProvider } from 'ethers';
import { XPHERE_NETWORK } from './constants';

// Advanced XpSwap Contract ABIs
const GOVERNANCE_TOKEN_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)",
  "function mint(address to, uint256 amount) external",
  "function delegates(address account) external view returns (address)",
  "function delegate(address delegatee) external",
  "function getVotes(address account) external view returns (uint256)"
];

const ADVANCED_AMM_ABI = [
  "function createAdvancedPool(address tokenA, address tokenB, uint256 baseFeeRate, uint256 initialPriceA, uint256 initialPriceB) external returns (bytes32 poolId)",
  "function swapWithProtection(bytes32 poolId, address tokenIn, uint256 amountIn, uint256 amountOutMin, address to, uint256 deadline) external returns (uint256 amountOut)",
  "function getAdvancedQuote(bytes32 poolId, address tokenIn, uint256 amountIn) external view returns (uint256 amountOut, uint256 priceImpact, uint256 dynamicFee, uint256 minimumAmountOut, bool mevRisk)",
  "function addAdvancedLiquidity(bytes32 poolId, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, uint256 lockPeriod, bool autoCompound) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)",
  "function getPoolAnalytics(bytes32 poolId) external view returns (uint256 tvl, uint256 volume24h, uint256 volatility, uint256 currentFeeRate, uint256 priceImpactScore, uint256 liquidityUtilization)",
  "function calculateDynamicFee(bytes32 poolId) external view returns (uint256)",
  "function getAllPairs() external view returns (address[] memory)",
  "event AdvancedSwap(bytes32 indexed poolId, address indexed user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 fee, uint256 priceImpact, uint256 dynamicFee)",
  "event MEVDetected(address indexed user, bytes32 indexed poolId, uint256 blockNumber, string reason)",
  "event DynamicFeeUpdated(bytes32 indexed poolId, uint256 oldFeeRate, uint256 newFeeRate, uint256 volatilityIndex)"
];

const FARMING_REWARDS_ABI = [
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function getReward() external",
  "function exit() external",
  "function stakeGovernanceToken(uint256 amount) external",
  "function withdrawGovernanceToken(uint256 amount) external",
  "function earned(address account) external view returns (uint256)",
  "function getUserInfo(address account) external view returns (uint256 staked, uint256 earned, uint256 boost, uint256 timeMultiplier, uint256 stakingDuration, uint256 governanceStaked)",
  "function getPoolInfo() external view returns (uint256 totalStaked, uint256 rewardRate, uint256 periodFinish, uint256 lastUpdateTime, uint256 rewardPerToken, uint256 totalRewardsPaid)",
  "event Staked(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event RewardPaid(address indexed user, uint256 reward)"
];

// AMM Algorithm Implementation
export class AMMAlgorithms {
  static readonly FEE_DENOMINATOR = 10000;
  static readonly BASIS_POINTS = 10000;

  /**
   * Calculate output amount using constant product formula with dynamic fees
   */
  static getAmountOut(
    amountIn: number,
    reserveIn: number,
    reserveOut: number,
    feeRate: number = 30 // 0.3% default
  ): number {
    if (amountIn <= 0 || reserveIn <= 0 || reserveOut <= 0) {
      throw new Error('Invalid input parameters');
    }

    const amountInWithFee = amountIn * (this.FEE_DENOMINATOR - feeRate);
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * this.FEE_DENOMINATOR + amountInWithFee;
    
    return numerator / denominator;
  }

  /**
   * Calculate required input amount for exact output
   */
  static getAmountIn(
    amountOut: number,
    reserveIn: number,
    reserveOut: number,
    feeRate: number = 30
  ): number {
    if (amountOut <= 0 || reserveIn <= 0 || reserveOut <= 0 || amountOut >= reserveOut) {
      throw new Error('Invalid input parameters');
    }

    const numerator = reserveIn * amountOut * this.FEE_DENOMINATOR;
    const denominator = (reserveOut - amountOut) * (this.FEE_DENOMINATOR - feeRate);
    
    return (numerator / denominator) + 1;
  }

  /**
   * Calculate price impact of a trade
   */
  static calculatePriceImpact(
    amountIn: number,
    reserveIn: number,
    reserveOut: number
  ): number {
    const amountOut = this.getAmountOut(amountIn, reserveIn, reserveOut);
    const priceImpact = (amountOut / reserveOut) * this.BASIS_POINTS;
    return Math.min(priceImpact, this.BASIS_POINTS);
  }

  /**
   * Calculate dynamic fee based on volatility and price impact
   */
  static calculateDynamicFee(
    baseFeeRate: number,
    priceImpact: number,
    volatilityIndex: number
  ): number {
    const impactMultiplier = 1 + (priceImpact / 1000); // 0.1% extra fee per 1% impact
    const volatilityMultiplier = 1 + (volatilityIndex / 100); // Scale with volatility
    
    const dynamicFee = baseFeeRate * impactMultiplier * volatilityMultiplier;
    return Math.min(dynamicFee, 1000); // Cap at 10%
  }

  /**
   * Calculate optimal liquidity amounts
   */
  static calculateOptimalAmounts(
    amountADesired: number,
    amountBDesired: number,
    reserveA: number,
    reserveB: number,
    amountAMin: number,
    amountBMin: number
  ): { amountA: number; amountB: number } {
    if (reserveA === 0 && reserveB === 0) {
      return { amountA: amountADesired, amountB: amountBDesired };
    }

    const amountBOptimal = (amountADesired * reserveB) / reserveA;
    if (amountBOptimal <= amountBDesired) {
      if (amountBOptimal < amountBMin) {
        throw new Error('Insufficient B amount');
      }
      return { amountA: amountADesired, amountB: amountBOptimal };
    } else {
      const amountAOptimal = (amountBDesired * reserveA) / reserveB;
      if (amountAOptimal > amountADesired || amountAOptimal < amountAMin) {
        throw new Error('Insufficient A amount');
      }
      return { amountA: amountAOptimal, amountB: amountBDesired };
    }
  }

  /**
   * Calculate liquidity tokens to mint
   */
  static calculateLiquidityMint(
    amountA: number,
    amountB: number,
    reserveA: number,
    reserveB: number,
    totalSupply: number
  ): number {
    if (totalSupply === 0) {
      return Math.sqrt(amountA * amountB) - 1000; // MINIMUM_LIQUIDITY
    }

    const liquidityA = (amountA * totalSupply) / reserveA;
    const liquidityB = (amountB * totalSupply) / reserveB;
    
    return Math.min(liquidityA, liquidityB);
  }

  /**
   * Assess MEV risk based on trading patterns
   */
  static assessMEVRisk(
    amountIn: number,
    reserveIn: number,
    recentTrades: Array<{ amount: number; timestamp: number; user: string }>,
    userAddress: string
  ): boolean {
    const threshold = reserveIn * 0.05; // 5% of reserve
    
    // High amount risk
    if (amountIn > threshold) return true;
    
    // Frequent trading risk
    const recentUserTrades = recentTrades.filter(
      t => t.user === userAddress && Date.now() - t.timestamp < 60000 // 1 minute
    );
    if (recentUserTrades.length > 3) return true;
    
    // Sandwich attack pattern detection
    const lastTrade = recentTrades[recentTrades.length - 1];
    if (lastTrade && lastTrade.user !== userAddress && Date.now() - lastTrade.timestamp < 10000) {
      return true;
    }
    
    return false;
  }

  /**
   * Calculate slippage protection amount
   */
  static calculateSlippageAmount(amount: number, slippagePercent: number): number {
    return amount * (1 - slippagePercent / 100);
  }

  /**
   * Calculate yield farming APY
   */
  static calculateAPY(
    rewardRate: number, // tokens per second
    rewardTokenPrice: number,
    totalStaked: number,
    stakingTokenPrice: number
  ): number {
    const yearlyRewards = rewardRate * 365 * 24 * 3600; // 1 year in seconds
    const yearlyRewardValue = yearlyRewards * rewardTokenPrice;
    const stakedValue = totalStaked * stakingTokenPrice;
    
    if (stakedValue === 0) return 0;
    return (yearlyRewardValue / stakedValue) * 100;
  }

  /**
   * Calculate boosted rewards based on governance token staking
   */
  static calculateBoostedRewards(
    baseRewards: number,
    governanceStaked: number,
    lpStaked: number,
    maxBoost: number = 2.5
  ): number {
    if (lpStaked === 0) return baseRewards;
    
    const ratio = governanceStaked / lpStaked;
    const boost = Math.min(1 + ratio, maxBoost);
    
    return baseRewards * boost;
  }
}

/**
 * Advanced Contract Service for interacting with XpSwap smart contracts
 */
export class AdvancedContractService {
  private provider: BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contracts: Map<string, ethers.Contract> = new Map();

  async initialize() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed');
    }

    this.provider = new BrowserProvider(window.ethereum);
    await this.provider.send("eth_requestAccounts", []);
    this.signer = this.provider.getSigner();

    // Ensure we're on Xphere network
    const network = await this.provider.getNetwork();
    if (network.chainId !== XPHERE_NETWORK.chainId) {
      await this.switchToXphereNetwork();
    }
  }

  async switchToXphereNetwork() {
    if (!window.ethereum) throw new Error('MetaMask not found');

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${XPHERE_NETWORK.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [XPHERE_NETWORK],
        });
      }
    }
  }

  getContract(address: string, abi: string[]): ethers.Contract {
    const key = `${address}-${abi.length}`;
    if (!this.contracts.has(key)) {
      if (!this.signer) throw new Error('Service not initialized');
      this.contracts.set(key, new ethers.Contract(address, abi, this.signer));
    }
    return this.contracts.get(key)!;
  }

  // Advanced swap with MEV protection
  async executeAdvancedSwap(
    poolId: string,
    tokenIn: string,
    amountIn: string,
    amountOutMin: string,
    to: string,
    contractAddress: string
  ): Promise<ethers.ContractTransaction> {
    const contract = this.getContract(contractAddress, ADVANCED_AMM_ABI);
    const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes

    return await contract.swapWithProtection(
      poolId,
      tokenIn,
      ethers.utils.parseEther(amountIn),
      ethers.utils.parseEther(amountOutMin),
      to,
      deadline
    );
  }

  // Get advanced quote with MEV and price impact analysis
  async getAdvancedQuote(
    poolId: string,
    tokenIn: string,
    amountIn: string,
    contractAddress: string
  ) {
    const contract = this.getContract(contractAddress, ADVANCED_AMM_ABI);
    
    const result = await contract.getAdvancedQuote(
      poolId,
      tokenIn,
      ethers.utils.parseEther(amountIn)
    );
    
    return {
      amountOut: ethers.utils.formatEther(result.amountOut),
      priceImpact: result.priceImpact.toNumber(),
      dynamicFee: result.dynamicFee.toNumber(),
      minimumAmountOut: ethers.utils.formatEther(result.minimumAmountOut),
      mevRisk: result.mevRisk
    };
  }

  // Stake LP tokens for farming rewards
  async stakeLPTokens(
    farmingPoolAddress: string,
    amount: string
  ): Promise<ethers.ContractTransaction> {
    const contract = this.getContract(farmingPoolAddress, FARMING_REWARDS_ABI);
    return await contract.stake(ethers.utils.parseEther(amount));
  }

  // Get farming information
  async getFarmingInfo(farmingPoolAddress: string, userAddress: string) {
    const contract = this.getContract(farmingPoolAddress, FARMING_REWARDS_ABI);
    
    const [userInfo, poolInfo] = await Promise.all([
      contract.getUserInfo(userAddress),
      contract.getPoolInfo()
    ]);

    return {
      user: {
        staked: ethers.utils.formatEther(userInfo.staked),
        earned: ethers.utils.formatEther(userInfo.earned),
        boost: userInfo.boost.toNumber(),
        timeMultiplier: userInfo.timeMultiplier.toNumber(),
        stakingDuration: userInfo.stakingDuration.toNumber(),
        governanceStaked: ethers.utils.formatEther(userInfo.governanceStaked)
      },
      pool: {
        totalStaked: ethers.utils.formatEther(poolInfo.totalStaked),
        rewardRate: ethers.utils.formatEther(poolInfo.rewardRate),
        periodFinish: poolInfo.periodFinish.toNumber(),
        rewardPerToken: ethers.utils.formatEther(poolInfo.rewardPerToken),
        totalRewardsPaid: ethers.utils.formatEther(poolInfo.totalRewardsPaid)
      }
    };
  }

  // Approve token spending
  async approveToken(
    tokenAddress: string,
    spenderAddress: string,
    amount: string
  ): Promise<ethers.ContractTransaction> {
    const contract = this.getContract(tokenAddress, [
      "function approve(address spender, uint256 amount) external returns (bool)"
    ]);
    
    return await contract.approve(spenderAddress, ethers.utils.parseEther(amount));
  }

  // Get token balance
  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    const contract = this.getContract(tokenAddress, [
      "function balanceOf(address account) external view returns (uint256)"
    ]);
    
    const balance = await contract.balanceOf(userAddress);
    return ethers.utils.formatEther(balance);
  }

  // Event listeners
  onAdvancedSwap(contractAddress: string, callback: (event: any) => void) {
    const contract = this.getContract(contractAddress, ADVANCED_AMM_ABI);
    contract.on("AdvancedSwap", callback);
  }

  onMEVDetected(contractAddress: string, callback: (event: any) => void) {
    const contract = this.getContract(contractAddress, ADVANCED_AMM_ABI);
    contract.on("MEVDetected", callback);
  }

  onRewardClaimed(farmingPoolAddress: string, callback: (event: any) => void) {
    const contract = this.getContract(farmingPoolAddress, FARMING_REWARDS_ABI);
    contract.on("RewardPaid", callback);
  }

  // Cleanup
  removeAllListeners() {
    this.contracts.forEach(contract => contract.removeAllListeners());
  }
}

export const advancedContractService = new AdvancedContractService();