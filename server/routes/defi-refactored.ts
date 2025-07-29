import { Router } from "express";
import { liquidityService } from "../services/defi/liquidityService";
import { farmingService } from "../services/defi/farmingService";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { validateRequest } from "../middleware/validation";
import { body, query } from "express-validator";

const router = Router();

/**
 * Liquidity Pool Endpoints
 */

// Get all liquidity pools
router.get("/liquidity/pools",
  [
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("offset").optional().isInt({ min: 0 }),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await liquidityService.getPools(limit, offset);
    res.json(result);
  })
);

// Get all pools (alias for backward compatibility)
router.get("/pools", 
  asyncHandler(async (req, res) => {
    const { pools } = await liquidityService.getPools();
    res.json(pools);
  })
);

// Add liquidity
router.post("/liquidity/add",
  [
    body("tokenA").isString(),
    body("tokenB").isString(),
    body("amountA").isNumeric(),
    body("amountB").isNumeric(),
    body("slippage").optional().isFloat({ min: 0, max: 100 }),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const walletAddress = req.headers['x-wallet-address'] as string;
    
    if (!walletAddress) {
      throw new ApiError("Wallet address is required", 400);
    }

    const result = await liquidityService.addLiquidity({
      ...req.body,
      walletAddress
    });

    res.json(result);
  })
);

// Remove liquidity
router.post("/liquidity/remove",
  [
    body("poolId").isString(),
    body("liquidity").isNumeric(),
    body("slippage").optional().isFloat({ min: 0, max: 100 }),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const walletAddress = req.headers['x-wallet-address'] as string;
    
    if (!walletAddress) {
      throw new ApiError("Wallet address is required", 400);
    }

    const result = await liquidityService.removeLiquidity({
      ...req.body,
      walletAddress
    });

    res.json(result);
  })
);

// Get user's liquidity positions
router.get("/liquidity/positions",
  asyncHandler(async (req, res) => {
    const walletAddress = req.query.address as string;
    
    if (!walletAddress) {
      throw new ApiError("Wallet address is required", 400);
    }

    const positions = await liquidityService.getUserPositions(walletAddress);
    res.json({ positions });
  })
);

// Calculate optimal liquidity amounts
router.post("/liquidity/calculate",
  [
    body("tokenA").isString(),
    body("tokenB").isString(),
    body("amountA").isNumeric(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { tokenA, tokenB, amountA } = req.body;
    
    const result = await liquidityService.calculateOptimalAmounts(
      tokenA,
      tokenB,
      amountA
    );

    res.json(result);
  })
);

/**
 * Farming Endpoints
 */

// Get all farming pools
router.get("/farming/pools",
  asyncHandler(async (req, res) => {
    const farms = await farmingService.getFarms();
    res.json({ farms });
  })
);

// Get all farms (alias)
router.get("/farms",
  asyncHandler(async (req, res) => {
    const farms = await farmingService.getFarms();
    res.json(farms);
  })
);

// Stake tokens
router.post("/farming/stake",
  [
    body("farmId").isString(),
    body("amount").isNumeric(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const walletAddress = req.headers['x-wallet-address'] as string;
    
    if (!walletAddress) {
      throw new ApiError("Wallet address is required", 400);
    }

    const result = await farmingService.stake({
      ...req.body,
      walletAddress
    });

    res.json(result);
  })
);

// Unstake tokens
router.post("/farming/unstake",
  [
    body("farmId").isString(),
    body("amount").isNumeric(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const walletAddress = req.headers['x-wallet-address'] as string;
    
    if (!walletAddress) {
      throw new ApiError("Wallet address is required", 400);
    }

    const result = await farmingService.unstake({
      ...req.body,
      walletAddress
    });

    res.json(result);
  })
);

// Claim rewards
router.post("/farming/claim",
  [
    body("farmId").isString(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const walletAddress = req.headers['x-wallet-address'] as string;
    
    if (!walletAddress) {
      throw new ApiError("Wallet address is required", 400);
    }

    const result = await farmingService.claimRewards({
      farmId: req.body.farmId,
      walletAddress
    });

    res.json(result);
  })
);

// Get user's farming positions
router.get("/farming/positions",
  asyncHandler(async (req, res) => {
    const walletAddress = req.query.address as string;
    
    if (!walletAddress) {
      throw new ApiError("Wallet address is required", 400);
    }

    const positions = await farmingService.getUserPositions(walletAddress);
    res.json({ positions });
  })
);

// Calculate pending rewards
router.get("/farming/rewards/:farmId",
  asyncHandler(async (req, res) => {
    const { farmId } = req.params;
    const walletAddress = req.query.address as string;
    
    if (!walletAddress) {
      throw new ApiError("Wallet address is required", 400);
    }

    const rewards = await farmingService.calculatePendingRewards(
      farmId,
      walletAddress
    );

    res.json({ 
      farmId,
      walletAddress,
      pendingRewards: rewards 
    });
  })
);

export default router;
