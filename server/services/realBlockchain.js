import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from '../../shared/constants.js';
import { DEX_ABI } from '../abi/dex.js';
import { TOKEN_ABI } from '../abi/token.js';
import { logger } from '../utils/logger.js';

export class BlockchainService {
  constructor() {
    // Use updated Ankr RPC URL
    this.rpcUrl = process.env.XPHERE_RPC_URL || 'https://www.ankr.com/rpc/xphere/';
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    this.dexContract = null;
    this.xpsTokenContract = null;
    
    this.initializeContracts();
  }

  async initializeContracts() {
    try {
      // Initialize DEX contract
      if (CONTRACT_ADDRESSES.XpSwapDEX) {
        this.dexContract = new ethers.Contract(
          CONTRACT_ADDRESSES.XpSwapDEX,
          DEX_ABI,
          this.provider
        );
      }

      // Initialize XPS token contract
      if (CONTRACT_ADDRESSES.XpSwapToken) {
        this.xpsTokenContract = new ethers.Contract(
          CONTRACT_ADDRESSES.XpSwapToken,
          TOKEN_ABI,
          this.provider
        );
      }
    } catch (error) {
      logger.error('Failed to initialize contracts', 'blockchain', { error: error.message });
    }
  }

  async getMarketStats() {
    try {
      const [blockNumber, gasPrice] = await Promise.all([
        this.provider.getBlockNumber(),
        this.provider.getFeeData()
      ]);

      // Try to get real data from contracts
      let totalValueLocked = "0";
      let activePairs = 0;
      let volume24h = "0";

      if (this.dexContract) {
        try {
          // These calls depend on your actual contract interface
          // Replace with actual contract methods
          // totalValueLocked = await this.dexContract.getTotalValueLocked();
          // activePairs = await this.dexContract.getActivePairsCount();
        } catch (contractError) {
          logger.warn('Contract calls failed, using defaults', 'blockchain', { error: contractError.message });
        }
      }

      return {
        totalValueLocked: ethers.formatEther(totalValueLocked),
        volume24h: ethers.formatEther(volume24h),
        activePairs,
        blockNumber,
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : '0'
      };
    } catch (error) {
      logger.error('Failed to get market stats', 'blockchain', { error: error.message });
      return {
        totalValueLocked: "0",
        volume24h: "0",
        activePairs: 0,
        blockNumber: 0,
        gasPrice: "0"
      };
    }
  }

  async getTokenBalance(tokenAddress, walletAddress) {
    try {
      if (tokenAddress === ethers.ZeroAddress) {
        // Native XP balance
        const balance = await this.provider.getBalance(walletAddress);
        return ethers.formatEther(balance);
      } else {
        // ERC20 token balance
        const tokenContract = new ethers.Contract(tokenAddress, TOKEN_ABI, this.provider);
        const balance = await tokenContract.balanceOf(walletAddress);
        return ethers.formatEther(balance);
      }
    } catch (error) {
      logger.error('Failed to get token balance', 'blockchain', { 
        error: error.message,
        tokenAddress,
        walletAddress 
      });
      return "0";
    }
  }

  async getPoolInfo(poolId) {
    try {
      if (!this.dexContract) {
        throw new Error('DEX contract not initialized');
      }

      // Replace with actual contract method
      // const poolInfo = await this.dexContract.getPool(poolId);
      
      // Return mock data for now
      return {
        token0: CONTRACT_ADDRESSES.XpSwapToken,
        token1: ethers.ZeroAddress,
        reserve0: ethers.parseEther("1000000"),
        reserve1: ethers.parseEther("50000"),
        totalSupply: ethers.parseEther("100000"),
        fee: 300 // 0.3%
      };
    } catch (error) {
      logger.error('Failed to get pool info', 'blockchain', { 
        error: error.message,
        poolId 
      });
      throw error;
    }
  }

  async executeSwap(params) {
    const { tokenIn, tokenOut, amountIn, amountOutMin, recipient, deadline } = params;
    
    try {
      if (!this.dexContract) {
        throw new Error('DEX contract not initialized');
      }

      // This would be the actual swap execution
      // const tx = await this.dexContract.swap(
      //   tokenIn,
      //   tokenOut,
      //   amountIn,
      //   amountOutMin,
      //   recipient,
      //   deadline
      // );
      
      // For now, return a mock transaction
      return {
        hash: '0x' + Math.random().toString(16).substring(2),
        from: recipient,
        to: CONTRACT_ADDRESSES.XpSwapDEX,
        value: amountIn,
        status: 'pending'
      };
    } catch (error) {
      logger.error('Failed to execute swap', 'blockchain', { 
        error: error.message,
        params 
      });
      throw error;
    }
  }

  async getTransactionReceipt(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      logger.error('Failed to get transaction receipt', 'blockchain', { 
        error: error.message,
        txHash 
      });
      return null;
    }
  }

  async getCurrentBlock() {
    try {
      const block = await this.provider.getBlock('latest');
      return block;
    } catch (error) {
      logger.error('Failed to get current block', 'blockchain', { error: error.message });
      return null;
    }
  }

  async estimateGas(transaction) {
    try {
      const gasEstimate = await this.provider.estimateGas(transaction);
      return gasEstimate;
    } catch (error) {
      logger.error('Failed to estimate gas', 'blockchain', { 
        error: error.message,
        transaction 
      });
      return ethers.parseUnits('500000', 'wei'); // Default gas limit
    }
  }
}

// Singleton instance
export const blockchainService = new BlockchainService();
