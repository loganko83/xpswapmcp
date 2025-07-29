import { Router } from "express";
import { marketDataService } from "../services/trading/marketDataService";
import { swapService } from "../services/trading/swapService";
import { 
  rateLimiters, 
  validators, 
  handleValidationErrors
} from "../middleware/security";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

const router = Router();

/**
 * Market Data Endpoints
 */

// Get market statistics
router.get("/market-stats", 
  asyncHandler(async (req, res) => {
    const stats = await marketDataService.getMarketStats();
    res.json(stats);
  })
);

// Get XP token price
router.get("/xp-price", 
  asyncHandler(async (req, res) => {
    const priceData = await marketDataService.getXPPrice();
    res.json(priceData);
  })
);

// Get XPS token price
router.get("/xps/price", 
  asyncHandler(async (req, res) => {
    const priceData = await marketDataService.getXPSPrice();
    res.json(priceData);
  })
);

/**
 * Swap Endpoints
 */

// Calculate swap quote
router.post("/swap/quote",
  validators.swap,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    console.log('🚀 Swap quote request:', req.body);
    
    const quote = await swapService.getQuote(req.body);
    res.json(quote);
  })
);

// Execute swap
router.post("/swap/execute",
  rateLimiters.trading,
  validators.swapExecute,
  handleValidationErrors,
  asyncHandler(async (req, res) => {
    console.log('🔄 Swap execute request:', req.body);
    
    if (!req.body.from) {
      throw new ApiError("Wallet address is required", 400);
    }
    
    const result = await swapService.executeSwap(req.body);
    res.json(result);
  })
);

// Get swap history
router.get("/swap/history",
  asyncHandler(async (req, res) => {
    const address = req.query.address as string;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (!address) {
      throw new ApiError("Address parameter is required", 400);
    }
    
    const history = await swapService.getSwapHistory(address, limit);
    res.json({ 
      transactions: history,
      total: history.length
    });
  })
);

// Get transaction status
router.get("/swap/status/:txHash",
  asyncHandler(async (req, res) => {
    const { txHash } = req.params;
    
    // Check cache for transaction
    const transaction = cache.get(`tx_${txHash}`);
    
    if (!transaction) {
      throw new ApiError("Transaction not found", 404);
    }
    
    res.json(transaction);
  })
);

export default router;
