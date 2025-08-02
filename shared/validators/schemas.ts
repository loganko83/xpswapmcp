import { z } from 'zod';

// Basic validation schemas
export const addressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format');

export const amountSchema = z.string()
  .regex(/^\d+(\.\d+)?$/, 'Invalid amount format')
  .refine(val => parseFloat(val) > 0, 'Amount must be greater than 0');

export const chainIdSchema = z.number()
  .int()
  .positive('Chain ID must be positive');

// Swap-related validations
export const swapQuoteSchema = z.object({
  fromTokenAddress: addressSchema,
  toTokenAddress: addressSchema,
  amount: amountSchema,
  slippage: z.number().min(0.1).max(50).optional().default(0.5),
  recipient: addressSchema.optional()
});

export const swapExecuteSchema = z.object({
  fromTokenAddress: addressSchema,
  toTokenAddress: addressSchema,
  amount: amountSchema,
  minAmountOut: amountSchema,
  recipient: addressSchema,
  deadline: z.number().int().positive(),
  signature: z.string().min(1, 'Signature required')
});

// Liquidity pool validations
export const addLiquiditySchema = z.object({
  tokenAAddress: addressSchema,
  tokenBAddress: addressSchema,
  amountADesired: amountSchema,
  amountBDesired: amountSchema,
  amountAMin: amountSchema,
  amountBMin: amountSchema,
  recipient: addressSchema,
  deadline: z.number().int().positive()
});

export const removeLiquiditySchema = z.object({
  tokenAAddress: addressSchema,
  tokenBAddress: addressSchema,
  liquidity: amountSchema,
  amountAMin: amountSchema,
  amountBMin: amountSchema,
  recipient: addressSchema,
  deadline: z.number().int().positive()
});

// Farming validations
export const stakeSchema = z.object({
  poolId: z.number().int().nonnegative(),
  amount: amountSchema,
  lockPeriod: z.number().int().min(0).max(365) // days
});

export const unstakeSchema = z.object({
  poolId: z.number().int().nonnegative(),
  amount: amountSchema
});

// Bridge validations
export const bridgeSchema = z.object({
  fromChainId: chainIdSchema,
  toChainId: chainIdSchema,
  tokenAddress: addressSchema,
  amount: amountSchema,
  recipient: addressSchema,
  slippage: z.number().min(0.1).max(50).optional().default(0.5)
});

// Security validations
export const signatureSchema = z.object({
  message: z.string().min(1),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/, 'Invalid signature format'),
  address: addressSchema
});

// API pagination
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc')
});

// Trading validations
export const orderSchema = z.object({
  type: z.enum(['market', 'limit', 'stop']),
  side: z.enum(['buy', 'sell']),
  symbol: z.string().min(1),
  amount: amountSchema,
  price: amountSchema.optional(),
  stopPrice: amountSchema.optional(),
  timeInForce: z.enum(['GTC', 'IOC', 'FOK']).optional().default('GTC')
});

// Options trading
export const optionOrderSchema = z.object({
  type: z.enum(['call', 'put']),
  strike: amountSchema,
  expiry: z.number().int().positive(),
  premium: amountSchema,
  size: amountSchema,
  underlying: addressSchema
});

// Futures trading
export const futuresOrderSchema = z.object({
  symbol: z.string().min(1),
  side: z.enum(['long', 'short']),
  size: amountSchema,
  leverage: z.number().min(1).max(100),
  collateral: amountSchema,
  stopLoss: amountSchema.optional(),
  takeProfit: amountSchema.optional()
});

// Flash loan validation
export const flashLoanSchema = z.object({
  assets: z.array(addressSchema).min(1).max(10),
  amounts: z.array(amountSchema).min(1).max(10),
  modes: z.array(z.number().int().min(0).max(2)).min(1).max(10),
  params: z.string().optional().default('0x')
}).refine(data => 
  data.assets.length === data.amounts.length && 
  data.amounts.length === data.modes.length, 
  'Assets, amounts, and modes arrays must have the same length'
);
