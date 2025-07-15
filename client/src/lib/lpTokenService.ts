import { ethers } from "ethers";

// LP Token ABI
const LP_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount)",
  "function burn(address from, uint256 amount)",
  "function calculateShare(uint256 lpAmount) view returns (uint256 amountA, uint256 amountB)",
  "function calculateRewards(address holder) view returns (uint256 rewardAmount)",
  "function updateRewardClaim(address holder, uint256 amount)",
  "function updateReserves(uint256 reserveA, uint256 reserveB)",
  "function reserveA() view returns (uint256)",
  "function reserveB() view returns (uint256)",
  "function tokenA() view returns (address)",
  "function tokenB() view returns (address)",
  "function pairAddress() view returns (address)",
  "event LiquidityMinted(address indexed to, uint256 amount)",
  "event LiquidityBurned(address indexed from, uint256 amount)",
  "event RewardsClaimed(address indexed user, uint256 amount)",
  "event ReservesUpdated(uint256 reserveA, uint256 reserveB)"
];

// LP Staking Pool ABI
const LP_STAKING_POOL_ABI = [
  "function stake(uint256 amount) external",
  "function unstake(uint256 amount) external",
  "function claimRewards() external",
  "function getStakedBalance(address user) view returns (uint256)",
  "function getPendingRewards(address user) view returns (uint256)",
  "function totalStaked() view returns (uint256)",
  "function rewardRate() view returns (uint256)",
  "function lpToken() view returns (address)"
];

// ERC20 ABI for token operations
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

export class LpTokenService {
  private provider: ethers.BrowserProvider;
  private signer: ethers.Signer | null = null;

  constructor() {
    if (typeof window !== "undefined" && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum, {
        name: "Xphere",
        chainId: 20250217
      });
    } else {
      throw new Error("MetaMask is not installed");
    }
  }

  async getSigner(): Promise<ethers.Signer> {
    if (!this.signer) {
      this.signer = await this.provider.getSigner();
    }
    return this.signer;
  }

  /**
   * Get LP token balance for a user
   */
  async getLpTokenBalance(lpTokenAddress: string, userAddress: string): Promise<string> {
    const contract = new ethers.Contract(lpTokenAddress, LP_TOKEN_ABI, this.provider);
    const balance = await contract.balanceOf(userAddress);
    return ethers.formatEther(balance);
  }

  /**
   * Get LP token total supply
   */
  async getLpTokenTotalSupply(lpTokenAddress: string): Promise<string> {
    const contract = new ethers.Contract(lpTokenAddress, LP_TOKEN_ABI, this.provider);
    const totalSupply = await contract.totalSupply();
    return ethers.formatEther(totalSupply);
  }

  /**
   * Calculate user's share of liquidity pool
   */
  async calculateLpTokenShare(lpTokenAddress: string, lpAmount: string): Promise<{
    amountA: string;
    amountB: string;
  }> {
    const contract = new ethers.Contract(lpTokenAddress, LP_TOKEN_ABI, this.provider);
    const lpAmountWei = ethers.parseEther(lpAmount);
    const [amountA, amountB] = await contract.calculateShare(lpAmountWei);
    
    return {
      amountA: ethers.formatEther(amountA),
      amountB: ethers.formatEther(amountB)
    };
  }

  /**
   * Calculate XPS rewards for LP token holder
   */
  async calculateLpRewards(lpTokenAddress: string, userAddress: string): Promise<string> {
    const contract = new ethers.Contract(lpTokenAddress, LP_TOKEN_ABI, this.provider);
    const rewards = await contract.calculateRewards(userAddress);
    return ethers.formatEther(rewards);
  }

  /**
   * Get pool reserves
   */
  async getPoolReserves(lpTokenAddress: string): Promise<{
    reserveA: string;
    reserveB: string;
    tokenA: string;
    tokenB: string;
  }> {
    const contract = new ethers.Contract(lpTokenAddress, LP_TOKEN_ABI, this.provider);
    const [reserveA, reserveB, tokenA, tokenB] = await Promise.all([
      contract.reserveA(),
      contract.reserveB(),
      contract.tokenA(),
      contract.tokenB()
    ]);
    
    return {
      reserveA: ethers.formatEther(reserveA),
      reserveB: ethers.formatEther(reserveB),
      tokenA,
      tokenB
    };
  }

  /**
   * Stake LP tokens in staking pool
   */
  async stakeLpTokens(stakingPoolAddress: string, lpTokenAddress: string, amount: string): Promise<string> {
    const signer = await this.getSigner();
    const stakingContract = new ethers.Contract(stakingPoolAddress, LP_STAKING_POOL_ABI, signer);
    const lpTokenContract = new ethers.Contract(lpTokenAddress, ERC20_ABI, signer);
    
    const amountWei = ethers.parseEther(amount);
    const userAddress = await signer.getAddress();
    
    // Check allowance first
    const allowance = await lpTokenContract.allowance(userAddress, stakingPoolAddress);
    if (allowance < amountWei) {
      // Approve LP tokens for staking
      const approveTx = await lpTokenContract.approve(stakingPoolAddress, amountWei);
      await approveTx.wait();
    }
    
    // Stake LP tokens
    const stakeTx = await stakingContract.stake(amountWei);
    const receipt = await stakeTx.wait();
    
    return receipt.transactionHash;
  }

  /**
   * Unstake LP tokens from staking pool
   */
  async unstakeLpTokens(stakingPoolAddress: string, amount: string): Promise<string> {
    const signer = await this.getSigner();
    const contract = new ethers.Contract(stakingPoolAddress, LP_STAKING_POOL_ABI, signer);
    
    const amountWei = ethers.parseEther(amount);
    const tx = await contract.unstake(amountWei);
    const receipt = await tx.wait();
    
    return receipt.transactionHash;
  }

  /**
   * Claim XPS rewards from LP staking
   */
  async claimLpRewards(stakingPoolAddress: string): Promise<string> {
    const signer = await this.getSigner();
    const contract = new ethers.Contract(stakingPoolAddress, LP_STAKING_POOL_ABI, signer);
    
    const tx = await contract.claimRewards();
    const receipt = await tx.wait();
    
    return receipt.transactionHash;
  }

  /**
   * Get staked LP token balance
   */
  async getStakedLpBalance(stakingPoolAddress: string, userAddress: string): Promise<string> {
    const contract = new ethers.Contract(stakingPoolAddress, LP_STAKING_POOL_ABI, this.provider);
    const balance = await contract.getStakedBalance(userAddress);
    return ethers.formatEther(balance);
  }

  /**
   * Get pending XPS rewards
   */
  async getPendingRewards(stakingPoolAddress: string, userAddress: string): Promise<string> {
    const contract = new ethers.Contract(stakingPoolAddress, LP_STAKING_POOL_ABI, this.provider);
    const rewards = await contract.getPendingRewards(userAddress);
    return ethers.formatEther(rewards);
  }

  /**
   * Get staking pool info
   */
  async getStakingPoolInfo(stakingPoolAddress: string): Promise<{
    totalStaked: string;
    rewardRate: string;
    lpToken: string;
  }> {
    const contract = new ethers.Contract(stakingPoolAddress, LP_STAKING_POOL_ABI, this.provider);
    const [totalStaked, rewardRate, lpToken] = await Promise.all([
      contract.totalStaked(),
      contract.rewardRate(),
      contract.lpToken()
    ]);
    
    return {
      totalStaked: ethers.formatEther(totalStaked),
      rewardRate: ethers.formatEther(rewardRate),
      lpToken
    };
  }

  /**
   * Transfer LP tokens
   */
  async transferLpTokens(lpTokenAddress: string, to: string, amount: string): Promise<string> {
    const signer = await this.getSigner();
    const contract = new ethers.Contract(lpTokenAddress, LP_TOKEN_ABI, signer);
    
    const amountWei = ethers.parseEther(amount);
    const tx = await contract.transfer(to, amountWei);
    const receipt = await tx.wait();
    
    return receipt.transactionHash;
  }

  /**
   * Approve LP token spending
   */
  async approveLpTokens(lpTokenAddress: string, spender: string, amount: string): Promise<string> {
    const signer = await this.getSigner();
    const contract = new ethers.Contract(lpTokenAddress, LP_TOKEN_ABI, signer);
    
    const amountWei = ethers.parseEther(amount);
    const tx = await contract.approve(spender, amountWei);
    const receipt = await tx.wait();
    
    return receipt.transactionHash;
  }

  /**
   * Get LP token allowance
   */
  async getLpTokenAllowance(lpTokenAddress: string, owner: string, spender: string): Promise<string> {
    const contract = new ethers.Contract(lpTokenAddress, LP_TOKEN_ABI, this.provider);
    const allowance = await contract.allowance(owner, spender);
    return ethers.formatEther(allowance);
  }
}

export const lpTokenService = new LpTokenService();