import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tokens = sqliteTable("tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  address: text("address").notNull().unique(),
  decimals: integer("decimals").notNull().default(18),
  logoUrl: text("logo_url"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const tradingPairs = sqliteTable("trading_pairs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  tokenAId: integer("token_a_id").notNull(),
  tokenBId: integer("token_b_id").notNull(),
  liquidityTokenA: text("liquidity_token_a").notNull().default("0"),
  liquidityTokenB: text("liquidity_token_b").notNull().default("0"),
  volume24h: text("volume_24h").notNull().default("0"),
  price: text("price").notNull().default("0"),
  priceChange24h: text("price_change_24h").notNull().default("0"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userAddress: text("user_address").notNull(),
  transactionHash: text("transaction_hash").notNull().unique(),
  type: text("type").notNull(), // 'swap', 'add_liquidity', 'remove_liquidity'
  tokenIn: text("token_in").notNull(),
  tokenOut: text("token_out").notNull(),
  amountIn: text("amount_in").notNull(),
  amountOut: text("amount_out").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'failed'
  blockNumber: integer("block_number"),
  gasUsed: text("gas_used"),
  gasPrice: text("gas_price"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const liquidityPools = sqliteTable("liquidity_pools", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pairId: integer("pair_id").notNull(),
  totalLiquidity: text("total_liquidity").notNull().default("0"),
  apr: text("apr").notNull().default("0"),
  rewardTokens: text("reward_tokens"), // JSON string instead of array
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// LP Tokens table - represents liquidity provider tokens
export const lpTokens = sqliteTable("lp_tokens", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  symbol: text("symbol").notNull().unique(), // e.g., "XP-USDT-LP"
  name: text("name").notNull(), // e.g., "XP-USDT LP Token"
  address: text("address").notNull().unique(), // Smart contract address
  pairId: integer("pair_id").notNull(), // References trading_pairs
  totalSupply: text("total_supply").notNull().default("0"),
  decimals: integer("decimals").notNull().default(18),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// LP Token Holdings - tracks user LP token balances
export const lpTokenHoldings = sqliteTable("lp_token_holdings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userAddress: text("user_address").notNull(),
  lpTokenId: integer("lp_token_id").notNull(),
  balance: text("balance").notNull().default("0"),
  stakedBalance: text("staked_balance").notNull().default("0"),
  totalRewardsClaimed: text("total_rewards_claimed").notNull().default("0"),
  lastRewardClaim: text("last_reward_claim"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// LP Rewards - XPS rewards for LP token holders
export const lpRewards = sqliteTable("lp_rewards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lpTokenId: integer("lp_token_id").notNull(),
  userAddress: text("user_address").notNull(),
  rewardAmount: text("reward_amount").notNull(),
  rewardType: text("reward_type").notNull().default("XPS"), // "XPS", "trading_fees"
  distributionDate: text("distribution_date").default("CURRENT_TIMESTAMP"),
  claimed: integer("claimed", { mode: "boolean" }).notNull().default(false),
  claimDate: text("claim_date"),
  transactionHash: text("transaction_hash"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// LP Staking Pools - for staking LP tokens to earn additional rewards
export const lpStakingPools = sqliteTable("lp_staking_pools", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lpTokenId: integer("lp_token_id").notNull(),
  name: text("name").notNull(), // e.g., "XP-USDT LP Staking Pool"
  description: text("description"),
  rewardTokenAddress: text("reward_token_address").notNull(), // XPS token address
  rewardRate: text("reward_rate").notNull(), // XPS per second
  totalStaked: text("total_staked").notNull().default("0"),
  startTime: text("start_time").notNull(),
  endTime: text("end_time"),
  minStakeAmount: text("min_stake_amount").notNull().default("0"),
  lockPeriod: integer("lock_period").notNull().default(0), // in seconds
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTokenSchema = createInsertSchema(tokens).omit({
  id: true,
  createdAt: true,
});

export const insertTradingPairSchema = createInsertSchema(tradingPairs).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export const insertLiquidityPoolSchema = createInsertSchema(liquidityPools).omit({
  id: true,
  createdAt: true,
});

export const insertLpTokenSchema = createInsertSchema(lpTokens).omit({
  id: true,
  createdAt: true,
});

export const insertLpTokenHoldingSchema = createInsertSchema(lpTokenHoldings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLpRewardSchema = createInsertSchema(lpRewards).omit({
  id: true,
  createdAt: true,
});

export const insertLpStakingPoolSchema = createInsertSchema(lpStakingPools).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Token = typeof tokens.$inferSelect;

export type InsertTradingPair = z.infer<typeof insertTradingPairSchema>;
export type TradingPair = typeof tradingPairs.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertLiquidityPool = z.infer<typeof insertLiquidityPoolSchema>;
export type LiquidityPool = typeof liquidityPools.$inferSelect;

export type InsertLpToken = z.infer<typeof insertLpTokenSchema>;
export type LpToken = typeof lpTokens.$inferSelect;

export type InsertLpTokenHolding = z.infer<typeof insertLpTokenHoldingSchema>;
export type LpTokenHolding = typeof lpTokenHoldings.$inferSelect;

export type InsertLpReward = z.infer<typeof insertLpRewardSchema>;
export type LpReward = typeof lpRewards.$inferSelect;

export type InsertLpStakingPool = z.infer<typeof insertLpStakingPoolSchema>;
export type LpStakingPool = typeof lpStakingPools.$inferSelect;
