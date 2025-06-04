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
