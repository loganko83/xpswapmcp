import { Router } from "express";
import { validateRequest } from "../middleware/validation";
import { body, query, param } from "express-validator";
import { asyncHandler } from "../utils/asyncHandler";
import { OptionsService } from "../services/advanced/optionsService";
import { FuturesService } from "../services/advanced/futuresService";
import { FlashLoanService } from "../services/advanced/flashLoanService";

const router = Router();

// Initialize services
const optionsService = new OptionsService();
const futuresService = new FuturesService();
const flashLoanService = new FlashLoanService();

// ===== OPTIONS TRADING ROUTES =====

// Get active options
router.get(
  "/options/active",
  [
    query("underlying").optional().isString(),
    query("type").optional().isIn(["CALL", "PUT"]),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { underlying, type } = req.query;
    const options = await optionsService.getActiveOptions(
      underlying as string,
      type as 'CALL' | 'PUT'
    );
    res.json(options);
  })
);

// Get options markets
router.get(
  "/options/markets",
  asyncHandler(async (req, res) => {
    const markets = await optionsService.getOptionMarkets();
    res.json(markets);
  })
);

// Get user's option positions
router.get(
  "/options/positions",
  [query("wallet").optional().isString()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const positions = await optionsService.getPositions(req.query.wallet as string);
    res.json(positions);
  })
);

// Buy option
router.post(
  "/options/buy",
  [
    body("optionId").isString(),
    body("amount").isNumeric(),
    body("buyer").isString(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const result = await optionsService.buyOption(
      req.body.optionId,
      req.body.amount,
      req.body.buyer
    );
    res.json(result);
  })
);

// Exercise option
router.post(
  "/options/exercise",
  [
    body("optionId").isString(),
    body("amount").isNumeric(),
    body("wallet").isString(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const result = await optionsService.exerciseOption(
      req.body.optionId,
      req.body.amount,
      req.body.wallet
    );
    res.json(result);
  })
);

// Close option position
router.post(
  "/options/close",
  [
    body("positionId").isString(),
    body("wallet").isString(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const result = await optionsService.closePosition(
      req.body.positionId,
      req.body.wallet
    );
    res.json(result);
  })
);

// ===== FUTURES TRADING ROUTES =====

// Get perpetual markets
router.get(
  "/perpetuals/markets",
  asyncHandler(async (req, res) => {
    const markets = await futuresService.getPerpetualMarkets();
    res.json(markets);
  })
);

// Get futures positions
router.get(
  "/futures/positions",
  [query("wallet").optional().isString()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const positions = await futuresService.getPositions(req.query.wallet as string);
    res.json(positions);
  })
);

// Get user's perpetual positions
router.get(
  "/perpetuals/positions/:wallet",
  [param("wallet").isString()],
  validateRequest,
  asyncHandler(async (req, res) => {
    const positions = await futuresService.getPositions(req.params.wallet);
    res.json(positions);
  })
);

// Open perpetual position
router.post(
  "/perpetuals/trade",
  [
    body("pair").isString(),
    body("size").isNumeric(),
    body("side").isIn(["LONG", "SHORT"]),
    body("leverage").isInt({ min: 1, max: 100 }),
    body("wallet").isString(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { pair, size, side, leverage, wallet } = req.body;
    const result = await futuresService.openPosition(
      pair,
      size,
      side,
      leverage,
      wallet
    );
    res.json(result);
  })
);

// Close perpetual position
router.post(
  "/perpetuals/close",
  [
    body("positionId").isString(),
    body("wallet").isString(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const result = await futuresService.closePosition(
      req.body.positionId,
      req.body.wallet
    );
    res.json(result);
  })
);

// Update position leverage
router.post(
  "/perpetuals/leverage",
  [
    body("positionId").isString(),
    body("leverage").isInt({ min: 1, max: 100 }),
    body("wallet").isString(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const result = await futuresService.updateLeverage(
      req.body.positionId,
      req.body.leverage,
      req.body.wallet
    );
    res.json(result);
  })
);

// Get funding rate history
router.get(
  "/perpetuals/funding/:pair",
  [
    param("pair").isString(),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const history = await futuresService.getFundingHistory(
      req.params.pair,
      parseInt(req.query.limit as string) || 10
    );
    res.json(history);
  })
);

// ===== FLASH LOAN ROUTES =====

// Get available flash loan pools
router.get(
  "/flashloans/pools",
  asyncHandler(async (req, res) => {
    const pools = await flashLoanService.getAvailablePools();
    res.json(pools);
  })
);

// Get available flash loans (backwards compatibility)
router.get(
  "/flashloans/available",
  asyncHandler(async (req, res) => {
    const loans = await flashLoanService.getAvailableLoans();
    res.json(loans);
  })
);

// Get flash loan templates
router.get(
  "/flashloans/templates",
  asyncHandler(async (req, res) => {
    const templates = await flashLoanService.getTemplates();
    res.json(templates);
  })
);

// Get flash loan analytics
router.get(
  "/flashloans/analytics",
  asyncHandler(async (req, res) => {
    const analytics = await flashLoanService.getAnalytics();
    res.json(analytics);
  })
);

// Calculate arbitrage opportunity
router.post(
  "/flashloans/arbitrage",
  [
    body("fromAsset").isString(),
    body("toAsset").isString(),
    body("amount").isNumeric(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { fromAsset, toAsset, amount } = req.body;
    const opportunity = await flashLoanService.calculateArbitrage(
      fromAsset,
      toAsset,
      amount
    );
    res.json(opportunity);
  })
);

// Execute flash loan
router.post(
  "/flashloans/execute",
  [
    body("asset").isString(),
    body("amount").isNumeric(),
    body("targetContract").isString(),
    body("calldata").isString(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const result = await flashLoanService.executeFlashLoan(req.body);
    res.json(result);
  })
);

// Get flash loan history
router.get(
  "/flashloans/history",
  [
    query("wallet").optional().isString(),
    query("limit").optional().isInt({ min: 1, max: 100 }),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const history = await flashLoanService.getFlashLoanHistory(
      req.query.wallet as string,
      parseInt(req.query.limit as string) || 10
    );
    res.json(history);
  })
);

// Validate flash loan strategy
router.post(
  "/flashloans/validate",
  [
    body("asset").isString(),
    body("amount").isNumeric(),
    body("strategy").isString(),
  ],
  validateRequest,
  asyncHandler(async (req, res) => {
    const { asset, amount, strategy } = req.body;
    const validation = await flashLoanService.validateFlashLoanStrategy(
      asset,
      amount,
      strategy
    );
    res.json(validation);
  })
);

export default router;
