import { pgTable, text, integer, real, timestamp, boolean, decimal, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tokens = pgTable("tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  address: text("address").notNull().unique(),
  decimals: integer("decimals").notNull().default(18),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tradingPairs = pgTable("trading_pairs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tokenAId: uuid("token_a_id").notNull(),
  tokenBId: uuid("token_b_id").notNull(),
  liquidityTokenA: decimal("liquidity_token_a", { precision: 78, scale: 0 }).notNull().default('0'),
  liquidityTokenB: decimal("liquidity_token_b", { precision: 78, scale: 0 }).notNull().default('0'),
  volume24h: decimal("volume_24h", { precision: 78, scale: 0 }).notNull().default('0'),
  price: decimal("price", { precision: 30, scale: 18 }).notNull().default('0'),
  priceChange24h: decimal("price_change_24h", { precision: 10, scale: 4 }).notNull().default('0'),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userAddress: text("user_address").notNull(),
  transactionHash: text("transaction_hash").notNull().unique(),
  type: text("type").notNull(), // 'swap', 'add_liquidity', 'remove_liquidity'
  tokenIn: text("token_in").notNull(),
  tokenOut: text("token_out").notNull(),
  amountIn: decimal("amount_in", { precision: 78, scale: 0 }).notNull(),
  amountOut: decimal("amount_out", { precision: 78, scale: 0 }).notNull(),
  status: text("status").notNull().default('pending'), // 'pending', 'confirmed', 'failed'
  blockNumber: integer("block_number"),
  gasUsed: decimal("gas_used", { precision: 30, scale: 0 }),
  gasPrice: decimal("gas_price", { precision: 30, scale: 0 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const liquidityPools = pgTable("liquidity_pools", {
  id: uuid("id").defaultRandom().primaryKey(),
  pairId: uuid("pair_id").notNull(),
  totalLiquidity: decimal("total_liquidity", { precision: 78, scale: 0 }).notNull().default('0'),
  apr: decimal("apr", { precision: 10, scale: 4 }).notNull().default('0'),
  rewardTokens: text("reward_tokens"), // JSON string
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// LP Tokens table - represents liquidity provider tokens
export const lpTokens = pgTable("lp_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  symbol: text("symbol").notNull().unique(), // e.g., "XP-USDT-LP"
  name: text("name").notNull(), // e.g., "XP-USDT LP Token"
  address: text("address").notNull().unique(), // Smart contract address
  pairId: uuid("pair_id").notNull(), // References trading_pairs
  totalSupply: decimal("total_supply", { precision: 78, scale: 0 }).notNull().default('0'),
  decimals: integer("decimals").notNull().default(18),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// LP Token Holdings - tracks user LP token balances
export const lpTokenHoldings = pgTable("lp_token_holdings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userAddress: text("user_address").notNull(),
  lpTokenId: uuid("lp_token_id").notNull(),
  balance: decimal("balance", { precision: 78, scale: 0 }).notNull().default('0'),
  stakedBalance: decimal("staked_balance", { precision: 78, scale: 0 }).notNull().default('0'),
  totalRewardsClaimed: decimal("total_rewards_claimed", { precision: 78, scale: 0 }).notNull().default('0'),
  lastRewardClaim: timestamp("last_reward_claim"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// LP Rewards - XPS rewards for LP token holders
export const lpRewards = pgTable("lp_rewards", {
  id: uuid("id").defaultRandom().primaryKey(),
  lpTokenId: uuid("lp_token_id").notNull(),
  userAddress: text("user_address").notNull(),
  rewardAmount: decimal("reward_amount", { precision: 78, scale: 0 }).notNull(),
  rewardType: text("reward_type").notNull().default("XPS"), // "XPS", "trading_fees"
  distributionDate: timestamp("distribution_date").defaultNow(),
  claimed: boolean("claimed").notNull().default(false),
  claimDate: timestamp("claim_date"),
  transactionHash: text("transaction_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});
