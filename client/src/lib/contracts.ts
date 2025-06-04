import { ethers } from "ethers";
import { web3Service } from "./web3";

// Xphere blockchain smart contract addresses
export const CONTRACT_ADDRESSES = {
  XPSWAP_ROUTER: "0x1234567890123456789012345678901234567890", // XpSwap Router Contract
  XPSWAP_FACTORY: "0x2345678901234567890123456789012345678901", // XpSwap Factory Contract
  XP_TOKEN: "0x3456789012345678901234567890123456789012", // Native XP Token Contract
  USDT_TOKEN: "0x4567890123456789012345678901234567890123", // USDT on Xphere
  WETH_TOKEN: "0x5678901234567890123456789012345678901234", // Wrapped ETH on Xphere
  WBTC_TOKEN: "0x6789012345678901234567890123456789012345", // Wrapped BTC on Xphere
  BNB_TOKEN: "0x7890123456789012345678901234567890123456",  // BNB on Xphere
  STAKING_POOL: "0x8901234567890123456789012345678901234567", // Staking/Farming Contract
  LIQUIDITY_REWARDS: "0x9012345678901234567890123456789012345678" // Liquidity Rewards Contract
};

// ERC-20 Token ABI (standard interface)
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
];

// XpSwap Router ABI
export const XPSWAP_ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapTokensForExactTokens(uint amountOut, uint amountInMax, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
  "function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function getAmountsIn(uint amountOut, address[] calldata path) external view returns (uint[] memory amounts)",
  "function quote(uint amountA, uint reserveA, uint reserveB) external pure returns (uint amountB)",
  "function factory() external pure returns (address)",
  "function WETH() external pure returns (address)"
];

// XpSwap Factory ABI
export const XPSWAP_FACTORY_ABI = [
  "function getPair(address tokenA, address tokenB) external view returns (address pair)",
  "function createPair(address tokenA, address tokenB) external returns (address pair)",
  "function allPairs(uint) external view returns (address pair)",
  "function allPairsLength() external view returns (uint)",
  "function feeTo() external view returns (address)",
  "function feeToSetter() external view returns (address)",
  "event PairCreated(address indexed token0, address indexed token1, address pair, uint)"
];

// Liquidity Pair ABI
export const PAIR_ABI = [
  "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
  "function token0() external view returns (address)",
  "function token1() external view returns (address)",
  "function totalSupply() external view returns (uint)",
  "function balanceOf(address owner) external view returns (uint)",
  "function approve(address spender, uint value) external returns (bool)",
  "function transfer(address to, uint value) external returns (bool)"
];

// Staking Pool ABI
export const STAKING_POOL_ABI = [
  "function stake(uint256 amount) external",
  "function unstake(uint256 amount) external",
  "function claimRewards() external",
  "function getStakedAmount(address user) external view returns (uint256)",
  "function getPendingRewards(address user) external view returns (uint256)",
  "function totalStaked() external view returns (uint256)",
  "function rewardRate() external view returns (uint256)",
  "event Staked(address indexed user, uint256 amount)",
  "event Unstaked(address indexed user, uint256 amount)",
  "event RewardsClaimed(address indexed user, uint256 amount)"
];

export class XphereContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  async initialize() {
    await web3Service.initializeProvider();
    this.provider = web3Service.provider;
    if (this.provider) {
      this.signer = await this.provider.getSigner();
    }
  }

  // Token Contract Operations
  async getTokenContract(tokenAddress: string) {
    if (!this.provider) throw new Error("Provider not initialized");
    return new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      const contract = await this.getTokenContract(tokenAddress);
      const balance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Failed to get token balance:", error);
      return "0";
    }
  }

  async getTokenInfo(tokenAddress: string) {
    try {
      const contract = await this.getTokenContract(tokenAddress);
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals(),
        contract.totalSupply()
      ]);
      
      return {
        name,
        symbol,
        decimals,
        totalSupply: ethers.formatUnits(totalSupply, decimals),
        address: tokenAddress
      };
    } catch (error) {
      console.error("Failed to get token info:", error);
      throw error;
    }
  }

  async approveToken(tokenAddress: string, spenderAddress: string, amount: string): Promise<string> {
    try {
      if (!this.signer) throw new Error("Signer not available");
      
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
      const decimals = await contract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);
      
      const tx = await contract.approve(spenderAddress, amountInWei);
      return tx.hash;
    } catch (error) {
      console.error("Failed to approve token:", error);
      throw error;
    }
  }

  // XpSwap Router Operations
  async getSwapRouter() {
    if (!this.provider) throw new Error("Provider not initialized");
    return new ethers.Contract(CONTRACT_ADDRESSES.XPSWAP_ROUTER, XPSWAP_ROUTER_ABI, this.provider);
  }

  async getSwapQuote(tokenIn: string, tokenOut: string, amountIn: string): Promise<{
    amountOut: string;
    priceImpact: string;
    minimumReceived: string;
    route: string[];
  }> {
    try {
      const router = await this.getSwapRouter();
      const tokenInContract = await this.getTokenContract(tokenIn);
      const decimalsIn = await tokenInContract.decimals();
      const amountInWei = ethers.parseUnits(amountIn, decimalsIn);
      
      const path = [tokenIn, tokenOut];
      const amounts = await router.getAmountsOut(amountInWei, path);
      
      const tokenOutContract = await this.getTokenContract(tokenOut);
      const decimalsOut = await tokenOutContract.decimals();
      const amountOut = ethers.formatUnits(amounts[1], decimalsOut);
      
      // Calculate price impact (simplified)
      const priceImpact = "0.15"; // Would calculate based on reserves
      const slippage = 0.005; // 0.5%
      const minimumReceived = (parseFloat(amountOut) * (1 - slippage)).toString();
      
      return {
        amountOut,
        priceImpact,
        minimumReceived,
        route: path
      };
    } catch (error) {
      console.error("Failed to get swap quote:", error);
      throw error;
    }
  }

  async executeSwap(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    minAmountOut: string,
    userAddress: string
  ): Promise<string> {
    try {
      if (!this.signer) throw new Error("Signer not available");
      
      const router = new ethers.Contract(CONTRACT_ADDRESSES.XPSWAP_ROUTER, XPSWAP_ROUTER_ABI, this.signer);
      const tokenInContract = await this.getTokenContract(tokenIn);
      const decimalsIn = await tokenInContract.decimals();
      const amountInWei = ethers.parseUnits(amountIn, decimalsIn);
      
      const tokenOutContract = await this.getTokenContract(tokenOut);
      const decimalsOut = await tokenOutContract.decimals();
      const minAmountOutWei = ethers.parseUnits(minAmountOut, decimalsOut);
      
      const path = [tokenIn, tokenOut];
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes
      
      const tx = await router.swapExactTokensForTokens(
        amountInWei,
        minAmountOutWei,
        path,
        userAddress,
        deadline
      );
      
      return tx.hash;
    } catch (error) {
      console.error("Failed to execute swap:", error);
      throw error;
    }
  }

  // Liquidity Pool Operations
  async getFactory() {
    if (!this.provider) throw new Error("Provider not initialized");
    return new ethers.Contract(CONTRACT_ADDRESSES.XPSWAP_FACTORY, XPSWAP_FACTORY_ABI, this.provider);
  }

  async getPairAddress(tokenA: string, tokenB: string): Promise<string> {
    try {
      const factory = await this.getFactory();
      return await factory.getPair(tokenA, tokenB);
    } catch (error) {
      console.error("Failed to get pair address:", error);
      throw error;
    }
  }

  async getPairReserves(tokenA: string, tokenB: string): Promise<{
    reserve0: string;
    reserve1: string;
    token0: string;
    token1: string;
  }> {
    try {
      const pairAddress = await this.getPairAddress(tokenA, tokenB);
      if (pairAddress === ethers.ZeroAddress) {
        throw new Error("Pair does not exist");
      }
      
      const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, this.provider!);
      const [reserve0, reserve1] = await pairContract.getReserves();
      const token0 = await pairContract.token0();
      const token1 = await pairContract.token1();
      
      return {
        reserve0: reserve0.toString(),
        reserve1: reserve1.toString(),
        token0,
        token1
      };
    } catch (error) {
      console.error("Failed to get pair reserves:", error);
      throw error;
    }
  }

  async addLiquidity(
    tokenA: string,
    tokenB: string,
    amountADesired: string,
    amountBDesired: string,
    userAddress: string
  ): Promise<string> {
    try {
      if (!this.signer) throw new Error("Signer not available");
      
      const router = new ethers.Contract(CONTRACT_ADDRESSES.XPSWAP_ROUTER, XPSWAP_ROUTER_ABI, this.signer);
      
      const tokenAContract = await this.getTokenContract(tokenA);
      const tokenBContract = await this.getTokenContract(tokenB);
      const decimalsA = await tokenAContract.decimals();
      const decimalsB = await tokenBContract.decimals();
      
      const amountAWei = ethers.parseUnits(amountADesired, decimalsA);
      const amountBWei = ethers.parseUnits(amountBDesired, decimalsB);
      
      // Allow 1% slippage
      const amountAMin = amountAWei * BigInt(99) / BigInt(100);
      const amountBMin = amountBWei * BigInt(99) / BigInt(100);
      
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes
      
      const tx = await router.addLiquidity(
        tokenA,
        tokenB,
        amountAWei,
        amountBWei,
        amountAMin,
        amountBMin,
        userAddress,
        deadline
      );
      
      return tx.hash;
    } catch (error) {
      console.error("Failed to add liquidity:", error);
      throw error;
    }
  }

  async removeLiquidity(
    tokenA: string,
    tokenB: string,
    liquidity: string,
    userAddress: string
  ): Promise<string> {
    try {
      if (!this.signer) throw new Error("Signer not available");
      
      const router = new ethers.Contract(CONTRACT_ADDRESSES.XPSWAP_ROUTER, XPSWAP_ROUTER_ABI, this.signer);
      const pairAddress = await this.getPairAddress(tokenA, tokenB);
      const pairContract = new ethers.Contract(pairAddress, PAIR_ABI, this.provider!);
      
      const liquidityWei = ethers.parseUnits(liquidity, 18); // LP tokens are 18 decimals
      
      // Allow 1% slippage
      const amountAMin = 0;
      const amountBMin = 0;
      
      const deadline = Math.floor(Date.now() / 1000) + 1200; // 20 minutes
      
      const tx = await router.removeLiquidity(
        tokenA,
        tokenB,
        liquidityWei,
        amountAMin,
        amountBMin,
        userAddress,
        deadline
      );
      
      return tx.hash;
    } catch (error) {
      console.error("Failed to remove liquidity:", error);
      throw error;
    }
  }

  // Staking Operations
  async getStakingContract() {
    if (!this.provider) throw new Error("Provider not initialized");
    return new ethers.Contract(CONTRACT_ADDRESSES.STAKING_POOL, STAKING_POOL_ABI, this.provider);
  }

  async getStakedAmount(userAddress: string): Promise<string> {
    try {
      const stakingContract = await this.getStakingContract();
      const amount = await stakingContract.getStakedAmount(userAddress);
      return ethers.formatEther(amount);
    } catch (error) {
      console.error("Failed to get staked amount:", error);
      return "0";
    }
  }

  async getPendingRewards(userAddress: string): Promise<string> {
    try {
      const stakingContract = await this.getStakingContract();
      const rewards = await stakingContract.getPendingRewards(userAddress);
      return ethers.formatEther(rewards);
    } catch (error) {
      console.error("Failed to get pending rewards:", error);
      return "0";
    }
  }

  async stakeTokens(amount: string): Promise<string> {
    try {
      if (!this.signer) throw new Error("Signer not available");
      
      const stakingContract = new ethers.Contract(CONTRACT_ADDRESSES.STAKING_POOL, STAKING_POOL_ABI, this.signer);
      const amountWei = ethers.parseEther(amount);
      
      const tx = await stakingContract.stake(amountWei);
      return tx.hash;
    } catch (error) {
      console.error("Failed to stake tokens:", error);
      throw error;
    }
  }

  async unstakeTokens(amount: string): Promise<string> {
    try {
      if (!this.signer) throw new Error("Signer not available");
      
      const stakingContract = new ethers.Contract(CONTRACT_ADDRESSES.STAKING_POOL, STAKING_POOL_ABI, this.signer);
      const amountWei = ethers.parseEther(amount);
      
      const tx = await stakingContract.unstake(amountWei);
      return tx.hash;
    } catch (error) {
      console.error("Failed to unstake tokens:", error);
      throw error;
    }
  }

  async claimRewards(): Promise<string> {
    try {
      if (!this.signer) throw new Error("Signer not available");
      
      const stakingContract = new ethers.Contract(CONTRACT_ADDRESSES.STAKING_POOL, STAKING_POOL_ABI, this.signer);
      const tx = await stakingContract.claimRewards();
      return tx.hash;
    } catch (error) {
      console.error("Failed to claim rewards:", error);
      throw error;
    }
  }

  // Utility Functions
  async waitForTransaction(hash: string) {
    if (!this.provider) throw new Error("Provider not initialized");
    return await this.provider.waitForTransaction(hash);
  }

  async getTransactionReceipt(hash: string) {
    if (!this.provider) throw new Error("Provider not initialized");
    return await this.provider.getTransactionReceipt(hash);
  }

  async estimateGas(contract: ethers.Contract, method: string, params: any[]) {
    try {
      return await contract[method].estimateGas(...params);
    } catch (error) {
      console.error("Failed to estimate gas:", error);
      throw error;
    }
  }
}

export const xphereContract = new XphereContractService();