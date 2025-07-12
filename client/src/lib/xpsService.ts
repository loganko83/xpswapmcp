import { ethers } from "ethers";
import { CONTRACT_ADDRESSES } from "./constants";

// XPS Token ABI (Essential functions)
const XPS_ABI = [
  // ERC20 Standard
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  
  // XPS Specific Functions
  "function calculateFeeDiscount(address user) view returns (uint256)",
  "function getEffectiveFee(address user, uint256 baseFee) view returns (uint256)",
  "function stakeTokens(uint256 amount, uint256 lockPeriod)",
  "function claimStakingRewards()",
  "function emergencyWithdraw()",
  "function calculateStakingRewards(address user) view returns (uint256)",
  "function getUserStakingInfo(address user) view returns (uint256, uint256, uint256, uint256, uint256)",
  "function getTokenInfo() view returns (uint256, uint256, uint256, uint256)",
  
  // Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
  "event StakingReward(address indexed user, uint256 amount)",
  "event EmergencyWithdraw(address indexed user, uint256 amount, uint256 penalty)"
];

export interface XPSTokenInfo {
  totalSupply: string;
  totalBurned: string;
  circulatingSupply: string;
  protocolRevenue: string;
}

export interface XPSStakingInfo {
  stakedAmount: string;
  stakingDuration: string;
  pendingRewards: string;
  lockPeriod: string;
  feeDiscount: string;
}

export interface XPSFeeDiscount {
  discount: number; // in basis points
  effectiveFee: number; // in basis points
}

export class XPSService {
  private provider: ethers.BrowserProvider | null = null;
  private contract: ethers.Contract | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {}

  async initialize(provider: ethers.BrowserProvider, signer?: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer || null;
    this.contract = new ethers.Contract(CONTRACT_ADDRESSES.XPSToken, XPS_ABI, provider);
  }

  // Basic ERC20 Functions
  async getBalance(address: string): Promise<string> {
    if (!this.contract) throw new Error("XPS service not initialized");
    const balance = await this.contract.balanceOf(address);
    return ethers.formatEther(balance);
  }

  async getTotalSupply(): Promise<string> {
    if (!this.contract) throw new Error("XPS service not initialized");
    const supply = await this.contract.totalSupply();
    return ethers.formatEther(supply);
  }

  async getTokenInfo(): Promise<XPSTokenInfo> {
    if (!this.contract) throw new Error("XPS service not initialized");
    const [totalSupply, totalBurned, circulatingSupply, protocolRevenue] = await this.contract.getTokenInfo();
    
    return {
      totalSupply: ethers.formatEther(totalSupply),
      totalBurned: ethers.formatEther(totalBurned),
      circulatingSupply: ethers.formatEther(circulatingSupply),
      protocolRevenue: ethers.formatEther(protocolRevenue)
    };
  }

  // Fee Discount Functions
  async calculateFeeDiscount(userAddress: string): Promise<number> {
    if (!this.contract) throw new Error("XPS service not initialized");
    const discount = await this.contract.calculateFeeDiscount(userAddress);
    return Number(discount);
  }

  async getEffectiveFee(userAddress: string, baseFee: number): Promise<XPSFeeDiscount> {
    if (!this.contract) throw new Error("XPS service not initialized");
    const discount = await this.calculateFeeDiscount(userAddress);
    const effectiveFee = await this.contract.getEffectiveFee(userAddress, baseFee);
    
    return {
      discount: Number(discount),
      effectiveFee: Number(effectiveFee)
    };
  }

  // Staking Functions
  async stakeTokens(amount: string, lockPeriod: number): Promise<string> {
    if (!this.contract || !this.signer) throw new Error("XPS service not initialized or no signer");
    const contractWithSigner = this.contract.connect(this.signer);
    const amountWei = ethers.parseEther(amount);
    
    const tx = await contractWithSigner.stakeTokens(amountWei, lockPeriod);
    return tx.hash;
  }

  async claimStakingRewards(): Promise<string> {
    if (!this.contract || !this.signer) throw new Error("XPS service not initialized or no signer");
    const contractWithSigner = this.contract.connect(this.signer);
    
    const tx = await contractWithSigner.claimStakingRewards();
    return tx.hash;
  }

  async emergencyWithdraw(): Promise<string> {
    if (!this.contract || !this.signer) throw new Error("XPS service not initialized or no signer");
    const contractWithSigner = this.contract.connect(this.signer);
    
    const tx = await contractWithSigner.emergencyWithdraw();
    return tx.hash;
  }

  async getUserStakingInfo(userAddress: string): Promise<XPSStakingInfo> {
    if (!this.contract) throw new Error("XPS service not initialized");
    const [stakedAmount, stakingDuration, pendingRewards, lockPeriod, feeDiscount] = 
      await this.contract.getUserStakingInfo(userAddress);
    
    return {
      stakedAmount: ethers.formatEther(stakedAmount),
      stakingDuration: stakingDuration.toString(),
      pendingRewards: ethers.formatEther(pendingRewards),
      lockPeriod: lockPeriod.toString(),
      feeDiscount: feeDiscount.toString()
    };
  }

  async calculateStakingRewards(userAddress: string): Promise<string> {
    if (!this.contract) throw new Error("XPS service not initialized");
    const rewards = await this.contract.calculateStakingRewards(userAddress);
    return ethers.formatEther(rewards);
  }

  // Token Transfer Functions
  async transfer(to: string, amount: string): Promise<string> {
    if (!this.contract || !this.signer) throw new Error("XPS service not initialized or no signer");
    const contractWithSigner = this.contract.connect(this.signer);
    const amountWei = ethers.parseEther(amount);
    
    const tx = await contractWithSigner.transfer(to, amountWei);
    return tx.hash;
  }

  async approve(spender: string, amount: string): Promise<string> {
    if (!this.contract || !this.signer) throw new Error("XPS service not initialized or no signer");
    const contractWithSigner = this.contract.connect(this.signer);
    const amountWei = ethers.parseEther(amount);
    
    const tx = await contractWithSigner.approve(spender, amountWei);
    return tx.hash;
  }

  async getAllowance(owner: string, spender: string): Promise<string> {
    if (!this.contract) throw new Error("XPS service not initialized");
    const allowance = await this.contract.allowance(owner, spender);
    return ethers.formatEther(allowance);
  }

  // Utility Functions
  static formatFeeDiscount(discount: number): string {
    return `${(discount / 100).toFixed(1)}%`;
  }

  static getFeeDiscountTier(balance: number): { tier: string; discount: number; nextTier?: { amount: number; discount: number } } {
    if (balance >= 100000) return { tier: "Platinum", discount: 7500 };
    if (balance >= 50000) return { tier: "Gold", discount: 5000, nextTier: { amount: 100000, discount: 7500 } };
    if (balance >= 10000) return { tier: "Silver", discount: 3000, nextTier: { amount: 50000, discount: 5000 } };
    if (balance >= 5000) return { tier: "Bronze", discount: 2000, nextTier: { amount: 10000, discount: 3000 } };
    if (balance >= 1000) return { tier: "Basic", discount: 1000, nextTier: { amount: 5000, discount: 2000 } };
    return { tier: "None", discount: 0, nextTier: { amount: 1000, discount: 1000 } };
  }

  static getStakingMultiplier(lockPeriod: number): number {
    if (lockPeriod >= 365) return 4.0;
    if (lockPeriod >= 180) return 2.5;
    if (lockPeriod >= 90) return 1.5;
    return 1.0;
  }

  static formatStakingDuration(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    return `${hours}h`;
  }
}

export const xpsService = new XPSService();

// Auto-initialize when web3 is available
if (typeof window !== 'undefined' && (window as any).ethereum) {
  import('./web3').then(async ({ web3Service }) => {
    try {
      await web3Service.initializeProvider();
      if (web3Service.provider) {
        await xpsService.initialize(web3Service.provider);
      }
    } catch (error) {
      console.debug('XPS service auto-initialization failed:', error);
    }
  });
}