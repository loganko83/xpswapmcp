// Options Trading Security Module
// Enhanced security validations for options trading

import { BigNumber } from 'ethers';

// Price manipulation detection thresholds
const PRICE_DEVIATION_THRESHOLD = 0.15; // 15% max deviation from oracle
const MIN_LIQUIDITY_THRESHOLD = 100000; // $100K minimum liquidity
const MAX_POSITION_SIZE = 0.1; // 10% of total liquidity
const VOLATILITY_SPIKE_THRESHOLD = 2; // 200% of average volatility

// Black-Scholes validation ranges
const MIN_IMPLIED_VOLATILITY = 0.1; // 10%
const MAX_IMPLIED_VOLATILITY = 5; // 500%
const MIN_TIME_TO_EXPIRY = 3600; // 1 hour
const MAX_TIME_TO_EXPIRY = 365 * 24 * 3600; // 1 year

export interface OptionSecurityCheck {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  riskScore: number;
}

export interface PriceOracleData {
  spotPrice: number;
  volatility: number;
  lastUpdate: number;
  sources: string[];
}

// Validate option parameters before trade
export function validateOptionTrade(
  strikePrice: number,
  spotPrice: number,
  impliedVolatility: number,
  timeToExpiry: number,
  quantity: number,
  totalLiquidity: number
): OptionSecurityCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  let riskScore = 0;

  // Strike price validation
  const priceDeviation = Math.abs(strikePrice - spotPrice) / spotPrice;
  if (priceDeviation > 0.5) {
    warnings.push('Strike price is far from spot price (>50% deviation)');
    riskScore += 20;
  }

  // Implied volatility validation
  if (impliedVolatility < MIN_IMPLIED_VOLATILITY) {
    errors.push(`Implied volatility too low: ${impliedVolatility}`);
  } else if (impliedVolatility > MAX_IMPLIED_VOLATILITY) {
    errors.push(`Implied volatility too high: ${impliedVolatility}`);
  } else if (impliedVolatility > 2) {
    warnings.push('Very high implied volatility detected');
    riskScore += 30;
  }

  // Time to expiry validation
  if (timeToExpiry < MIN_TIME_TO_EXPIRY) {
    errors.push('Option expires too soon (minimum 1 hour)');
  } else if (timeToExpiry > MAX_TIME_TO_EXPIRY) {
    errors.push('Option expiry too far (maximum 1 year)');
  }

  // Position size validation
  const positionValue = quantity * spotPrice;
  const positionRatio = positionValue / totalLiquidity;
  
  if (positionRatio > MAX_POSITION_SIZE) {
    errors.push(`Position size too large: ${(positionRatio * 100).toFixed(2)}% of liquidity`);
  } else if (positionRatio > 0.05) {
    warnings.push(`Large position size: ${(positionRatio * 100).toFixed(2)}% of liquidity`);
    riskScore += 15;
  }

  // Liquidity check
  if (totalLiquidity < MIN_LIQUIDITY_THRESHOLD) {
    warnings.push('Low liquidity warning');
    riskScore += 25;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    riskScore: Math.min(riskScore, 100)
  };
}

// Validate Greeks calculations
export function validateGreeks(
  delta: number,
  gamma: number,
  theta: number,
  vega: number,
  rho: number
): boolean {
  // Delta should be between -1 and 1
  if (Math.abs(delta) > 1) return false;
  
  // Gamma should be positive
  if (gamma < 0) return false;
  
  // Theta is typically negative for long positions
  // Vega should be positive
  if (vega < 0) return false;
  
  return true;
}

// Detect potential price manipulation
export function detectPriceManipulation(
  currentPrice: number,
  oraclePrice: number,
  recentPrices: number[]
): boolean {
  const deviation = Math.abs(currentPrice - oraclePrice) / oraclePrice;
  
  if (deviation > PRICE_DEVIATION_THRESHOLD) {
    return true;
  }
  
  // Check for sudden price spikes
  if (recentPrices.length > 0) {
    const avgPrice = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    const spikeDeviation = Math.abs(currentPrice - avgPrice) / avgPrice;
    
    if (spikeDeviation > 0.2) { // 20% spike
      return true;
    }
  }
  
  return false;
}

// Calculate margin requirements
export function calculateMarginRequirement(
  optionType: 'call' | 'put',
  strikePrice: number,
  spotPrice: number,
  quantity: number,
  volatility: number
): number {
  const moneyness = optionType === 'call' 
    ? Math.max(0, spotPrice - strikePrice)
    : Math.max(0, strikePrice - spotPrice);
  
  // Base margin: 20% of notional + in-the-money amount
  const notional = quantity * spotPrice;
  const baseMargin = notional * 0.2 + (moneyness * quantity);
  
  // Volatility adjustment
  const volAdjustment = 1 + (volatility - 0.3) * 0.5; // Adjust based on vol
  
  return baseMargin * Math.max(1, volAdjustment);
}

// Validate expiry date
export function validateExpiryDate(expiryTimestamp: number): boolean {
  const now = Date.now() / 1000;
  const timeToExpiry = expiryTimestamp - now;
  
  return timeToExpiry >= MIN_TIME_TO_EXPIRY && timeToExpiry <= MAX_TIME_TO_EXPIRY;
}

// Risk scoring for option positions
export function calculateOptionRiskScore(
  position: {
    delta: number;
    gamma: number;
    vega: number;
    notionalValue: number;
    daysToExpiry: number;
  }
): number {
  let score = 0;
  
  // Delta risk
  if (Math.abs(position.delta) > 0.8) score += 20;
  else if (Math.abs(position.delta) > 0.6) score += 10;
  
  // Gamma risk
  if (position.gamma > 0.1) score += 25;
  else if (position.gamma > 0.05) score += 15;
  
  // Vega risk
  if (position.vega > 100) score += 20;
  else if (position.vega > 50) score += 10;
  
  // Time decay risk
  if (position.daysToExpiry < 7) score += 25;
  else if (position.daysToExpiry < 30) score += 15;
  
  return Math.min(score, 100);
}

// Anti-MEV protection for options
export function generateAntiMEVParams(
  basePrice: number,
  isMarketOrder: boolean
): { minPrice: number; maxPrice: number; deadline: number } {
  const slippageTolerance = isMarketOrder ? 0.02 : 0.005; // 2% for market, 0.5% for limit
  const minPrice = basePrice * (1 - slippageTolerance);
  const maxPrice = basePrice * (1 + slippageTolerance);
  const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
  
  return { minPrice, maxPrice, deadline };
}
