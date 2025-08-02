import { Router } from "express";
import { validateRequest } from "../middleware/validation";
import { body, query } from "express-validator";
import { BlockchainService } from "../services/realBlockchain";

const router = Router();
const blockchainService = new BlockchainService();

// Get all liquidity pools
router.get(
  "/liquidity/pools",
  [
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("offset").optional().isInt({ min: 0 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      // Get pools from blockchain
      const pools = await blockchainService.getLiquidityPools();
      
      // Apply pagination
      const paginatedPools = pools.slice(offset, offset + limit);
      
      res.json({
        pools: paginatedPools,
        total: pools.length,
        limit,
        offset
      });
    } catch (error) {
      console.error("Error fetching pools:", error);
      res.status(500).json({ error: "Failed to fetch liquidity pools" });
    }
  }
);

// Get all pools (alias for backward compatibility)
router.get("/pools", async (req, res) => {
  try {
    const pools = await blockchainService.getLiquidityPools();
    res.json(pools);
  } catch (error) {
    console.error("Error fetching pools:", error);
    res.status(500).json({ error: "Failed to fetch pools" });
  }
});

// Add liquidity
router.post(
  "/liquidity/add",
  [
    body("tokenA").isString(),
    body("tokenB").isString(),
    body("amountA").isNumeric(),
    body("amountB").isNumeric(),
    body("slippage").optional().isFloat({ min: 0, max: 100 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { tokenA, tokenB, amountA, amountB, slippage = 0.5 } = req.body;

      // In production, this would interact with smart contracts
      const result = await blockchainService.addLiquidity({
        tokenA,
        tokenB,
        amountA,
        amountB,
        slippage,
        walletAddress: req.headers['x-wallet-address'] as string
      });

      res.json(result);
    } catch (error) {
      console.error("Error adding liquidity:", error);
      res.status(500).json({ error: "Failed to add liquidity" });
    }
  }
);

// Remove liquidity
router.post(
  "/liquidity/remove",
  [
    body("poolId").isString(),
    body("liquidity").isNumeric(),
    body("slippage").optional().isFloat({ min: 0, max: 100 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { poolId, liquidity, slippage = 0.5 } = req.body;

      const result = await blockchainService.removeLiquidity({
        poolId,
        liquidity,
        slippage,
        walletAddress: req.headers['x-wallet-address'] as string
      });

      res.json(result);
    } catch (error) {
      console.error("Error removing liquidity:", error);
      res.status(500).json({ error: "Failed to remove liquidity" });
    }
  }
);

// Get farming pools
router.get(
  "/farming/pools",
  [
    query("active").optional().isBoolean(),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const isActive = req.query.active === "true";
      const limit = parseInt(req.query.limit as string) || 20;

      const pools = await blockchainService.getFarmingPools(isActive);
      const limitedPools = pools.slice(0, limit);

      res.json(limitedPools);
    } catch (error) {
      console.error("Error fetching farming pools:", error);
      res.status(500).json({ error: "Failed to fetch farming pools" });
    }
  }
);

// Stake in farming pool
router.post(
  "/farming/stake",
  [
    body("poolId").isString(),
    body("amount").isNumeric(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { poolId, amount } = req.body;

      const result = await blockchainService.stakeFarming({
        poolId,
        amount,
        walletAddress: req.headers['x-wallet-address'] as string
      });

      res.json(result);
    } catch (error) {
      console.error("Error staking:", error);
      res.status(500).json({ error: "Failed to stake tokens" });
    }
  }
);

// Unstake from farming pool
router.post(
  "/farming/unstake",
  [
    body("poolId").isString(),
    body("amount").isNumeric(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { poolId, amount } = req.body;

      const result = await blockchainService.unstakeFarming({
        poolId,
        amount,
        walletAddress: req.headers['x-wallet-address'] as string
      });

      res.json(result);
    } catch (error) {
      console.error("Error unstaking:", error);
      res.status(500).json({ error: "Failed to unstake tokens" });
    }
  }
);

// Claim rewards
router.post(
  "/farming/claim",
  [
    body("poolId").isString(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { poolId } = req.body;

      const result = await blockchainService.claimRewards({
        poolId,
        walletAddress: req.headers['x-wallet-address'] as string
      });

      res.json(result);
    } catch (error) {
      console.error("Error claiming rewards:", error);
      res.status(500).json({ error: "Failed to claim rewards" });
    }
  }
);

// Get user farming positions
router.get(
  "/farming/positions/:wallet",
  async (req, res) => {
    try {
      const { wallet } = req.params;

      const positions = await blockchainService.getUserFarmingPositions(wallet);

      res.json(positions);
    } catch (error) {
      console.error("Error fetching positions:", error);
      res.status(500).json({ error: "Failed to fetch farming positions" });
    }
  }
);

// Get staking pools
router.get(
  "/staking/pools",
  [
    query("active").optional().isBoolean(),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const isActive = req.query.active === "true";
      const limit = parseInt(req.query.limit as string) || 20;

      // Debug: Check available methods
      console.log('BlockchainService methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(blockchainService)));
      console.log('Has getStakingPools:', typeof blockchainService.getStakingPools);

      const pools = await blockchainService.getStakingPools(isActive);
      const limitedPools = pools.slice(0, limit);

      res.json(limitedPools);
    } catch (error) {
      console.error("Error fetching staking pools:", error);
      res.status(500).json({ error: "Failed to fetch staking pools" });
    }
  }
);

// Stake tokens
router.post(
  "/staking/stake",
  [
    body("poolId").isString(),
    body("amount").isNumeric(),
    body("duration").optional().isInt({ min: 1 }),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { poolId, amount, duration = 30 } = req.body;

      const result = await blockchainService.stakeTokens({
        poolId,
        amount,
        duration,
        walletAddress: req.headers['x-wallet-address'] as string
      });

      res.json(result);
    } catch (error) {
      console.error("Error staking tokens:", error);
      res.status(500).json({ error: "Failed to stake tokens" });
    }
  }
);

// Unstake tokens
router.post(
  "/staking/unstake",
  [
    body("positionId").isString(),
    body("amount").optional().isNumeric(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { positionId, amount } = req.body;

      const result = await blockchainService.unstakeTokens({
        positionId,
        amount,
        walletAddress: req.headers['x-wallet-address'] as string
      });

      res.json(result);
    } catch (error) {
      console.error("Error unstaking tokens:", error);
      res.status(500).json({ error: "Failed to unstake tokens" });
    }
  }
);

// Get user staking positions
router.get(
  "/staking/positions/:wallet",
  async (req, res) => {
    try {
      const { wallet } = req.params;

      const positions = await blockchainService.getUserStakingPositions(wallet);

      res.json(positions);
    } catch (error) {
      console.error("Error fetching staking positions:", error);
      res.status(500).json({ error: "Failed to fetch staking positions" });
    }
  }
);

// Claim staking rewards
router.post(
  "/staking/claim",
  [
    body("positionId").isString(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { positionId } = req.body;

      const result = await blockchainService.claimStakingRewards({
        positionId,
        walletAddress: req.headers['x-wallet-address'] as string
      });

      res.json(result);
    } catch (error) {
      console.error("Error claiming staking rewards:", error);
      res.status(500).json({ error: "Failed to claim staking rewards" });
    }
  }
);

// Get staking rewards
router.get(
  "/staking/rewards/:wallet",
  async (req, res) => {
    try {
      const { wallet } = req.params;

      const rewards = await blockchainService.getStakingRewards(wallet);

      res.json(rewards);
    } catch (error) {
      console.error("Error fetching staking rewards:", error);
      res.status(500).json({ error: "Failed to fetch staking rewards" });
    }
  }
);

// Get liquidity pool details
router.get(
  "/liquidity/pool/:poolId",
  async (req, res) => {
    try {
      const { poolId } = req.params;

      const poolDetails = await blockchainService.getPoolDetails(poolId);

      res.json(poolDetails);
    } catch (error) {
      console.error("Error fetching pool details:", error);
      res.status(500).json({ error: "Failed to fetch pool details" });
    }
  }
);

// Get user liquidity positions
router.get(
  "/liquidity/positions/:wallet",
  async (req, res) => {
    try {
      const { wallet } = req.params;

      const positions = await blockchainService.getUserLiquidityPositions(wallet);

      res.json(positions);
    } catch (error) {
      console.error("Error fetching liquidity positions:", error);
      res.status(500).json({ error: "Failed to fetch liquidity positions" });
    }
  }
);

// Get user DeFi overview
router.get(
  "/overview/:wallet",
  async (req, res) => {
    try {
      const { wallet } = req.params;

      const [
        liquidityPositions,
        stakingPositions,
        farmingPositions,
        stakingRewards
      ] = await Promise.all([
        blockchainService.getUserLiquidityPositions(wallet),
        blockchainService.getUserStakingPositions(wallet),
        blockchainService.getUserFarmingPositions(wallet),
        blockchainService.getStakingRewards(wallet)
      ]);

      // Calculate total values
      const totalLiquidityValue = liquidityPositions.reduce((sum, pos) => sum + (pos.value || 0), 0);
      const totalStakingValue = stakingPositions.reduce((sum, pos) => sum + (pos.value || 0), 0);
      const totalFarmingValue = farmingPositions.reduce((sum, pos) => sum + (pos.value || 0), 0);
      const totalRewardsValue = stakingRewards.reduce((sum, reward) => sum + (reward.value || 0), 0);

      const overview = {
        wallet,
        totalValue: totalLiquidityValue + totalStakingValue + totalFarmingValue,
        breakdown: {
          liquidity: {
            value: totalLiquidityValue,
            positions: liquidityPositions.length
          },
          staking: {
            value: totalStakingValue,
            positions: stakingPositions.length
          },
          farming: {
            value: totalFarmingValue,
            positions: farmingPositions.length
          },
          rewards: {
            value: totalRewardsValue,
            available: stakingRewards.length
          }
        },
        timestamp: Date.now()
      };

      res.json(overview);
    } catch (error) {
      console.error("Error fetching DeFi overview:", error);
      res.status(500).json({ error: "Failed to fetch DeFi overview" });
    }
  }
);

export default router;
