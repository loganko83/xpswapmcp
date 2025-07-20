// Perpetual Futures Security Module
// Enhanced security for leveraged trading

export interface FuturesSecurityCheck {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  liquidationPrice: number;
  maxLeverage: number;
  marginRatio: number;
}

// Security constants
const MAX_LEVERAGE = 125;
const MIN_MARGIN_RATIO = 0.005; // 0.5%
const LIQUIDATION_BUFFER = 0.02; // 2% buffer
const MAX_POSITION_VALUE = 1000000; // $1M max position
const FUNDING_RATE_CAP = 0.01; // 1% max funding rate

// Price impact thresholds
const PRICE_IMPACT_WARNING = 0.01; // 1%
const PRICE_IMPACT_ERROR = 0.05; // 5%

export function validateFuturesTrade(
  leverage: number,
  positionSize: number,
  accountBalance: number,
  markPrice: number,
  indexPrice: number,
  liquidityDepth: number
): FuturesSecurityCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Leverage validation
  if (leverage > MAX_LEVERAGE) {
    errors.push(`Leverage exceeds maximum: ${leverage}x > ${MAX_LEVERAGE}x`);
  } else if (leverage > 50) {
    warnings.push(`High leverage warning: ${leverage}x`);
  }
  
  // Position size validation
  const positionValue = positionSize * markPrice;
  if (positionValue > MAX_POSITION_VALUE) {
    errors.push(`Position size exceeds maximum: $${positionValue.toLocaleString()}`);
  }
  
  // Account balance check
  const requiredMargin = positionValue / leverage;
  if (requiredMargin > accountBalance) {
    errors.push(`Insufficient balance: Required $${requiredMargin.toFixed(2)}, Available $${accountBalance.toFixed(2)}`);
  }
  
  // Price deviation check
  const priceDeviation = Math.abs(markPrice - indexPrice) / indexPrice;
  if (priceDeviation > 0.02) {
    warnings.push(`Mark price deviates from index: ${(priceDeviation * 100).toFixed(2)}%`);
  }
  
  // Price impact calculation
  const priceImpact = calculatePriceImpact(positionSize, liquidityDepth);
  if (priceImpact > PRICE_IMPACT_ERROR) {
    errors.push(`Excessive price impact: ${(priceImpact * 100).toFixed(2)}%`);
  } else if (priceImpact > PRICE_IMPACT_WARNING) {
    warnings.push(`High price impact: ${(priceImpact * 100).toFixed(2)}%`);
  }
  
  // Calculate liquidation price
  const marginRatio = 1 / leverage;
  const liquidationPrice = calculateLiquidationPrice(
    markPrice,
    leverage,
    positionSize > 0 ? 'long' : 'short'
  );
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    liquidationPrice,
    maxLeverage: calculateMaxSafeLeverage(accountBalance, positionValue),
    marginRatio
  };
}

function calculatePriceImpact(orderSize: number, liquidityDepth: number): number {
  // Simplified price impact model
  return Math.pow(Math.abs(orderSize) / liquidityDepth, 1.5);
}

export function calculateLiquidationPrice(
  entryPrice: number,
  leverage: number,
  direction: 'long' | 'short'
): number {
  const maintenanceMargin = 0.005; // 0.5%
  const liquidationThreshold = 1 - (1 / leverage) + maintenanceMargin + LIQUIDATION_BUFFER;
  
  if (direction === 'long') {
    return entryPrice * (1 - liquidationThreshold);
  } else {
    return entryPrice * (1 + liquidationThreshold);
  }
}

export function calculateMaxSafeLeverage(
  accountBalance: number,
  positionValue: number
): number {
  const riskFactor = 0.8; // Use only 80% of max leverage for safety
  const theoreticalMax = accountBalance / (positionValue * MIN_MARGIN_RATIO);
  return Math.min(Math.floor(theoreticalMax * riskFactor), MAX_LEVERAGE);
}

export function validateFundingRate(
  fundingRate: number,
  marketConditions: {
    volatility: number;
    openInterestRatio: number;
    premiumIndex: number;
  }
): { isValid: boolean; adjustedRate: number } {
  // Cap funding rate
  const cappedRate = Math.max(-FUNDING_RATE_CAP, Math.min(FUNDING_RATE_CAP, fundingRate));
  
  // Validate against market conditions
  const expectedRate = calculateExpectedFundingRate(marketConditions);
  const deviation = Math.abs(cappedRate - expectedRate);
  
  return {
    isValid: deviation < 0.005, // 0.5% max deviation
    adjustedRate: cappedRate
  };
}

function calculateExpectedFundingRate(conditions: {
  volatility: number;
  openInterestRatio: number;
  premiumIndex: number;
}): number {
  // Simplified funding rate calculation
  const baseRate = 0.0001; // 0.01% base
  const volatilityAdjustment = conditions.volatility * 0.01;
  const oiAdjustment = (conditions.openInterestRatio - 1) * 0.001;
  const premiumAdjustment = conditions.premiumIndex * 0.001;
  
  return baseRate + volatilityAdjustment + oiAdjustment + premiumAdjustment;
}

export function detectManipulation(
  markPrice: number,
  indexPrice: number,
  recentTrades: Array<{ price: number; volume: number; timestamp: number }>
): { isManipulated: boolean; confidence: number; type?: string } {
  const priceDeviation = Math.abs(markPrice - indexPrice) / indexPrice;
  
  // Check for price manipulation
  if (priceDeviation > 0.05) {
    return { isManipulated: true, confidence: 0.9, type: 'price_deviation' };
  }
  
  // Check for wash trading patterns
  const volumeSpikes = detectVolumeAnomalies(recentTrades);
  if (volumeSpikes > 3) {
    return { isManipulated: true, confidence: 0.7, type: 'wash_trading' };
  }
  
  // Check for spoofing
  const priceMovements = analyzePriceMovements(recentTrades);
  if (priceMovements.reversals > 5 && priceMovements.avgReversal < 60) {
    return { isManipulated: true, confidence: 0.6, type: 'spoofing' };
  }
  
  return { isManipulated: false, confidence: 0 };
}

function detectVolumeAnomalies(trades: Array<{ volume: number }>): number {
  const avgVolume = trades.reduce((sum, t) => sum + t.volume, 0) / trades.length;
  const spikes = trades.filter(t => t.volume > avgVolume * 3).length;
  return spikes;
}

function analyzePriceMovements(
  trades: Array<{ price: number; timestamp: number }>
): { reversals: number; avgReversal: number } {
  let reversals = 0;
  let reversalTimes: number[] = [];
  
  for (let i = 2; i < trades.length; i++) {
    const prev = trades[i - 1].price - trades[i - 2].price;
    const curr = trades[i].price - trades[i - 1].price;
    
    if (prev * curr < 0) { // Direction changed
      reversals++;
      reversalTimes.push(trades[i].timestamp - trades[i - 1].timestamp);
    }
  }
  
  const avgReversal = reversalTimes.length > 0
    ? reversalTimes.reduce((a, b) => a + b, 0) / reversalTimes.length
    : Infinity;
  
  return { reversals, avgReversal };
}
