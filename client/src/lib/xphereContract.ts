import { ethers } from "ethers";

// Xphere Network Configuration
const XPHERE_NETWORK = {
  chainId: 20250217,
  name: "Xphere",
  rpcUrl: "https://en-bkk.x-phere.com",
  nativeCurrency: {
    name: "Xphere",
    symbol: "XP",
    decimals: 18,
  },
  blockExplorerUrl: "https://explorer.x-phere.com",
};

// Real Xphere smart contract addresses (to be updated after deployment)
export const XPHERE_CONTRACTS = {
  XPSWAP_DEX: "0x0000000000000000000000000000000000000000",
  XP_TOKEN: "0x0000000000000000000000000000000000000000",
  USDT_TOKEN: "0x0000000000000000000000000000000000000000",
  ETH_TOKEN: "0x0000000000000000000000000000000000000000",
  BTC_TOKEN: "0x0000000000000000000000000000000000000000",
  BNB_TOKEN: "0x0000000000000000000000000000000000000000"
};

// XpSwap DEX Contract ABI
export const XPSWAP_DEX_ABI = [
  "function createPool(address tokenA, address tokenB, uint256 feeRate) external returns (bytes32 poolId)",
  "function addLiquidity(bytes32 poolId, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)",
  "function removeLiquidity(bytes32 poolId, uint256 liquidity, uint256 amountAMin, uint256 amountBMin) external returns (uint256 amountA, uint256 amountB)",
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address to) external returns (uint256[] memory amounts)",
  "function getAmountsOut(uint256 amountIn, address[] memory path) external view returns (uint256[] memory amounts)",
  "function getPoolInfo(bytes32 poolId) external view returns (tuple(address tokenA, address tokenB, uint256 reserveA, uint256 reserveB, uint256 totalLiquidity, uint256 feeRate, bool active))",
  "function getPoolId(address tokenA, address tokenB) external pure returns (bytes32)",
  "function getAllPools() external view returns (bytes32[] memory)",
  "function getUserLiquidity(bytes32 poolId, address user) external view returns (tuple(uint256 amount, uint256 rewardDebt))",
  "event PoolCreated(bytes32 indexed poolId, address indexed tokenA, address indexed tokenB, uint256 feeRate)",
  "event LiquidityAdded(bytes32 indexed poolId, address indexed user, uint256 amountA, uint256 amountB, uint256 liquidity)",
  "event LiquidityRemoved(bytes32 indexed poolId, address indexed user, uint256 amountA, uint256 amountB, uint256 liquidity)",
  "event TokenSwapped(bytes32 indexed poolId, address indexed user, address indexed tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut, uint256 fee)"
];

// ERC20 Token ABI
export const ERC20_ABI = [
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) external returns (bool)"
];

export class XphereBlockchainService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private dexContract: ethers.Contract | null = null;

  async initialize() {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Switch to Xphere network if needed
        await this.switchToXphere();
        
        this.signer = await this.provider.getSigner();
        
        // Initialize DEX contract
        if (XPHERE_CONTRACTS.XPSWAP_DEX !== "0x0000000000000000000000000000000000000000") {
          this.dexContract = new ethers.Contract(
            XPHERE_CONTRACTS.XPSWAP_DEX,
            XPSWAP_DEX_ABI,
            this.signer
          );
        }
        
        return true;
      }
      throw new Error("MetaMask not detected");
    } catch (error) {
      console.error("Failed to initialize Xphere blockchain service:", error);
      throw error;
    }
  }

  async switchToXphere() {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${XPHERE_NETWORK.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // Network not added, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${XPHERE_NETWORK.chainId.toString(16)}`,
              chainName: XPHERE_NETWORK.name,
              nativeCurrency: XPHERE_NETWORK.nativeCurrency,
              rpcUrls: [XPHERE_NETWORK.rpcUrl],
              blockExplorerUrls: [XPHERE_NETWORK.blockExplorerUrl],
            },
          ],
        });
      } else {
        throw switchError;
      }
    }
  }

  // Token Operations
  async getTokenContract(tokenAddress: string) {
    if (!this.provider) throw new Error("Provider not initialized");
    return new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      if (tokenAddress === "0x0000000000000000000000000000000000000000") {
        // Native XP balance
        const balance = await this.provider!.getBalance(userAddress);
        return ethers.formatEther(balance);
      } else {
        // ERC20 token balance
        const contract = await this.getTokenContract(tokenAddress);
        const balance = await contract.balanceOf(userAddress);
        const decimals = await contract.decimals();
        return ethers.formatUnits(balance, decimals);
      }
    } catch (error) {
      console.error("Failed to get token balance:", error);
      return "0";
    }
  }

  async approveToken(tokenAddress: string, amount: string): Promise<string> {
    try {
      if (!this.signer) throw new Error("Signer not available");
      
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer);
      const decimals = await contract.decimals();
      const amountInWei = ethers.parseUnits(amount, decimals);
      
      const tx = await contract.approve(XPHERE_CONTRACTS.XPSWAP_DEX, amountInWei);
      return tx.hash;
    } catch (error) {
      console.error("Failed to approve token:", error);
      throw error;
    }
  }

  // DEX Operations
  async getSwapQuote(tokenIn: string, tokenOut: string, amountIn: string): Promise<{
    amountOut: string;
    priceImpact: string;
    route: string[];
  }> {
    try {
      if (!this.dexContract) throw new Error("DEX contract not initialized");
      
      const tokenInContract = await this.getTokenContract(tokenIn);
      const decimalsIn = await tokenInContract.decimals();
      const amountInWei = ethers.parseUnits(amountIn, decimalsIn);
      
      const path = [tokenIn, tokenOut];
      const amounts = await this.dexContract.getAmountsOut(amountInWei, path);
      
      const tokenOutContract = await this.getTokenContract(tokenOut);
      const decimalsOut = await tokenOutContract.decimals();
      const amountOut = ethers.formatUnits(amounts[1], decimalsOut);
      
      return {
        amountOut,
        priceImpact: "0.15", // Calculate based on pool reserves
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
    minAmountOut: string
  ): Promise<string> {
    try {
      if (!this.dexContract || !this.signer) throw new Error("DEX contract or signer not available");
      
      const userAddress = await this.signer.getAddress();
      const tokenInContract = await this.getTokenContract(tokenIn);
      const decimalsIn = await tokenInContract.decimals();
      const amountInWei = ethers.parseUnits(amountIn, decimalsIn);
      
      const tokenOutContract = await this.getTokenContract(tokenOut);
      const decimalsOut = await tokenOutContract.decimals();
      const minAmountOutWei = ethers.parseUnits(minAmountOut, decimalsOut);
      
      const path = [tokenIn, tokenOut];
      
      const tx = await this.dexContract.swapExactTokensForTokens(
        amountInWei,
        minAmountOutWei,
        path,
        userAddress
      );
      
      return tx.hash;
    } catch (error) {
      console.error("Failed to execute swap:", error);
      throw error;
    }
  }

  // Liquidity Operations
  async getPoolInfo(tokenA: string, tokenB: string) {
    try {
      if (!this.dexContract) throw new Error("DEX contract not initialized");
      
      const poolId = await this.dexContract.getPoolId(tokenA, tokenB);
      const poolInfo = await this.dexContract.getPoolInfo(poolId);
      
      return {
        poolId,
        tokenA: poolInfo.tokenA,
        tokenB: poolInfo.tokenB,
        reserveA: poolInfo.reserveA.toString(),
        reserveB: poolInfo.reserveB.toString(),
        totalLiquidity: poolInfo.totalLiquidity.toString(),
        feeRate: poolInfo.feeRate.toString(),
        active: poolInfo.active
      };
    } catch (error) {
      console.error("Failed to get pool info:", error);
      throw error;
    }
  }

  async addLiquidity(
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string
  ): Promise<string> {
    try {
      if (!this.dexContract) throw new Error("DEX contract not initialized");
      
      const poolId = await this.dexContract.getPoolId(tokenA, tokenB);
      
      const tokenAContract = await this.getTokenContract(tokenA);
      const tokenBContract = await this.getTokenContract(tokenB);
      const decimalsA = await tokenAContract.decimals();
      const decimalsB = await tokenBContract.decimals();
      
      const amountAWei = ethers.parseUnits(amountA, decimalsA);
      const amountBWei = ethers.parseUnits(amountB, decimalsB);
      
      // Set minimum amounts (1% slippage)
      const amountAMin = amountAWei * BigInt(99) / BigInt(100);
      const amountBMin = amountBWei * BigInt(99) / BigInt(100);
      
      const tx = await this.dexContract.addLiquidity(
        poolId,
        amountAWei,
        amountBWei,
        amountAMin,
        amountBMin
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
    liquidity: string
  ): Promise<string> {
    try {
      if (!this.dexContract) throw new Error("DEX contract not initialized");
      
      const poolId = await this.dexContract.getPoolId(tokenA, tokenB);
      const liquidityWei = ethers.parseUnits(liquidity, 18);
      
      const tx = await this.dexContract.removeLiquidity(
        poolId,
        liquidityWei,
        0, // amountAMin
        0  // amountBMin
      );
      
      return tx.hash;
    } catch (error) {
      console.error("Failed to remove liquidity:", error);
      throw error;
    }
  }

  async getUserLiquidity(tokenA: string, tokenB: string, userAddress: string) {
    try {
      if (!this.dexContract) throw new Error("DEX contract not initialized");
      
      const poolId = await this.dexContract.getPoolId(tokenA, tokenB);
      const userLiquidity = await this.dexContract.getUserLiquidity(poolId, userAddress);
      
      return {
        amount: ethers.formatUnits(userLiquidity.amount, 18),
        rewardDebt: ethers.formatUnits(userLiquidity.rewardDebt, 18)
      };
    } catch (error) {
      console.error("Failed to get user liquidity:", error);
      return { amount: "0", rewardDebt: "0" };
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

  isInitialized(): boolean {
    return this.provider !== null && this.signer !== null;
  }

  async getNetworkInfo() {
    if (!this.provider) throw new Error("Provider not initialized");
    const network = await this.provider.getNetwork();
    return {
      chainId: Number(network.chainId),
      name: network.name
    };
  }
}

// Export singleton instance
export const xphereBlockchain = new XphereBlockchainService();