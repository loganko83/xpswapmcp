import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  address: text("address").notNull().unique(),
  decimals: integer("decimals").notNull().default(18),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tradingPairs = pgTable("trading_pairs", {
  id: serial("id").primaryKey(),
  tokenAId: integer("token_a_id").notNull(),
  tokenBId: integer("token_b_id").notNull(),
  liquidityTokenA: decimal("liquidity_token_a", { precision: 36, scale: 18 }).notNull().default("0"),
  liquidityTokenB: decimal("liquidity_token_b", { precision: 36, scale: 18 }).notNull().default("0"),
  volume24h: decimal("volume_24h", { precision: 36, scale: 18 }).notNull().default("0"),
  price: decimal("price", { precision: 36, scale: 18 }).notNull().default("0"),
  priceChange24h: decimal("price_change_24h", { precision: 10, scale: 4 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userAddress: text("user_address").notNull(),
  transactionHash: text("transaction_hash").notNull().unique(),
  type: text("type").notNull(), // 'swap', 'add_liquidity', 'remove_liquidity'
  tokenIn: text("token_in").notNull(),
  tokenOut: text("token_out").notNull(),
  amountIn: decimal("amount_in", { precision: 36, scale: 18 }).notNull(),
  amountOut: decimal("amount_out", { precision: 36, scale: 18 }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'failed'
  blockNumber: integer("block_number"),
  gasUsed: decimal("gas_used", { precision: 20, scale: 0 }),
  gasPrice: decimal("gas_price", { precision: 20, scale: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const liquidityPools = pgTable("liquidity_pools", {
  id: serial("id").primaryKey(),
  pairId: integer("pair_id").notNull(),
  totalLiquidity: decimal("total_liquidity", { precision: 36, scale: 18 }).notNull().default("0"),
  apr: decimal("apr", { precision: 10, scale: 4 }).notNull().default("0"),
  rewardTokens: text("reward_tokens").array(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// LP Tokens table - represents liquidity provider tokens
export const lpTokens = pgTable("lp_tokens", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(), // e.g., "XP-USDT-LP"
  name: text("name").notNull(), // e.g., "XP-USDT LP Token"
  address: text("address").notNull().unique(), // Smart contract address
  pairId: integer("pair_id").notNull(), // References trading_pairs
  totalSupply: decimal("total_supply", { precision: 36, scale: 18 }).notNull().default("0"),
  decimals: integer("decimals").notNull().default(18),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// LP Token Holdings - tracks user LP token balances
export const lpTokenHoldings = pgTable("lp_token_holdings", {
  id: serial("id").primaryKey(),
  userAddress: text("user_address").notNull(),
  lpTokenId: integer("lp_token_id").notNull(),
  balance: decimal("balance", { precision: 36, scale: 18 }).notNull().default("0"),
  stakedBalance: decimal("staked_balance", { precision: 36, scale: 18 }).notNull().default("0"),
  totalRewardsClaimed: decimal("total_rewards_claimed", { precision: 36, scale: 18 }).notNull().default("0"),
  lastRewardClaim: timestamp("last_reward_claim"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// LP Rewards - XPS rewards for LP token holders
export const lpRewards = pgTable("lp_rewards", {
  id: serial("id").primaryKey(),
  lpTokenId: integer("lp_token_id").notNull(),
  userAddress: text("user_address").notNull(),
  rewardAmount: decimal("reward_amount", { precision: 36, scale: 18 }).notNull(),
  rewardType: text("reward_type").notNull().default("XPS"), // "XPS", "trading_fees"
  distributionDate: timestamp("distribution_date").defaultNow(),
  claimed: boolean("claimed").notNull().default(false),
  claimDate: timestamp("claim_date"),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

// LP Staking Pools - for staking LP tokens to earn additional rewards
export const lpStakingPools = pgTable("lp_staking_pools", {
  id: serial("id").primaryKey(),
  lpTokenId: integer("lp_token_id").notNull(),
  name: text("name").notNull(), // e.g., "XP-USDT LP Staking Pool"
  description: text("description"),
  rewardTokenAddress: text("reward_token_address").notNull(), // XPS token address
  rewardRate: decimal("reward_rate", { precision: 36, scale: 18 }).notNull(), // XPS per second
  totalStaked: decimal("total_staked", { precision: 36, scale: 18 }).notNull().default("0"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  minStakeAmount: decimal("min_stake_amount", { precision: 36, scale: 18 }).notNull().default("0"),
  lockPeriod: integer("lock_period").notNull().default(0), // in seconds
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
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
