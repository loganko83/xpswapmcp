import { 
  tokens, 
  tradingPairs, 
  transactions, 
  liquidityPools,
  lpTokens,
  lpTokenHoldings,
  lpRewards,
  lpStakingPools,
  type Token, 
  type InsertToken,
  type TradingPair,
  type InsertTradingPair,
  type Transaction,
  type InsertTransaction,
  type LiquidityPool,
  type InsertLiquidityPool,
  type LpToken,
  type InsertLpToken,
  type LpTokenHolding,
  type InsertLpTokenHolding,
  type LpReward,
  type InsertLpReward,
  type LpStakingPool,
  type InsertLpStakingPool
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Token operations
  getTokens(): Promise<Token[]>;
  getTokenById(id: number): Promise<Token | undefined>;
  getTokenBySymbol(symbol: string): Promise<Token | undefined>;
  createToken(token: InsertToken): Promise<Token>;
  updateToken(id: number, token: Partial<InsertToken>): Promise<Token | undefined>;

  // Trading pair operations
  getTradingPairs(): Promise<TradingPair[]>;
  getTradingPairById(id: number): Promise<TradingPair | undefined>;
  createTradingPair(pair: InsertTradingPair): Promise<TradingPair>;
  updateTradingPair(id: number, pair: Partial<InsertTradingPair>): Promise<TradingPair | undefined>;

  // Transaction operations
  getTransactions(userAddress?: string): Promise<Transaction[]>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: number, status: Transaction["status"]): Promise<Transaction | undefined>;

  // Liquidity pool operations
  getLiquidityPools(): Promise<LiquidityPool[]>;
  getLiquidityPoolById(id: number): Promise<LiquidityPool | undefined>;
  createLiquidityPool(pool: InsertLiquidityPool): Promise<LiquidityPool>;
  updateLiquidityPool(id: number, pool: Partial<InsertLiquidityPool>): Promise<LiquidityPool | undefined>;

  // LP Token operations
  getLpTokens(): Promise<LpToken[]>;
  getLpTokenById(id: number): Promise<LpToken | undefined>;
  getLpTokenByPairId(pairId: number): Promise<LpToken | undefined>;
  createLpToken(lpToken: InsertLpToken): Promise<LpToken>;
  updateLpToken(id: number, lpToken: Partial<InsertLpToken>): Promise<LpToken | undefined>;

  // LP Token Holdings operations
  getLpTokenHoldings(userAddress?: string): Promise<LpTokenHolding[]>;
  getLpTokenHoldingById(id: number): Promise<LpTokenHolding | undefined>;
  getLpTokenHoldingByUserAndToken(userAddress: string, lpTokenId: number): Promise<LpTokenHolding | undefined>;
  createLpTokenHolding(holding: InsertLpTokenHolding): Promise<LpTokenHolding>;
  updateLpTokenHolding(id: number, holding: Partial<InsertLpTokenHolding>): Promise<LpTokenHolding | undefined>;

  // LP Rewards operations
  getLpRewards(userAddress?: string): Promise<LpReward[]>;
  getLpRewardById(id: number): Promise<LpReward | undefined>;
  getUnclaimedLpRewards(userAddress: string): Promise<LpReward[]>;
  createLpReward(reward: InsertLpReward): Promise<LpReward>;
  updateLpReward(id: number, reward: Partial<InsertLpReward>): Promise<LpReward | undefined>;

  // LP Staking Pool operations
  getLpStakingPools(): Promise<LpStakingPool[]>;
  getLpStakingPoolById(id: number): Promise<LpStakingPool | undefined>;
  getLpStakingPoolByLpTokenId(lpTokenId: number): Promise<LpStakingPool | undefined>;
  createLpStakingPool(pool: InsertLpStakingPool): Promise<LpStakingPool>;
  updateLpStakingPool(id: number, pool: Partial<InsertLpStakingPool>): Promise<LpStakingPool | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getTokens(): Promise<Token[]> {
    return await db.select().from(tokens);
  }

  async getTokenById(id: number): Promise<Token | undefined> {
    const [token] = await db.select().from(tokens).where(eq(tokens.id, id));
    return token || undefined;
  }

  async getTokenBySymbol(symbol: string): Promise<Token | undefined> {
    const [token] = await db.select().from(tokens).where(eq(tokens.symbol, symbol));
    return token || undefined;
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const [token] = await db
      .insert(tokens)
      .values(insertToken)
      .returning();
    return token;
  }

  async updateToken(id: number, tokenUpdate: Partial<InsertToken>): Promise<Token | undefined> {
    const [token] = await db
      .update(tokens)
      .set(tokenUpdate)
      .where(eq(tokens.id, id))
      .returning();
    return token || undefined;
  }

  async getTradingPairs(): Promise<TradingPair[]> {
    return await db.select().from(tradingPairs);
  }

  async getTradingPairById(id: number): Promise<TradingPair | undefined> {
    const [pair] = await db.select().from(tradingPairs).where(eq(tradingPairs.id, id));
    return pair || undefined;
  }

  async createTradingPair(insertPair: InsertTradingPair): Promise<TradingPair> {
    const [pair] = await db
      .insert(tradingPairs)
      .values(insertPair)
      .returning();
    return pair;
  }

  async updateTradingPair(id: number, pairUpdate: Partial<InsertTradingPair>): Promise<TradingPair | undefined> {
    const [pair] = await db
      .update(tradingPairs)
      .set(pairUpdate)
      .where(eq(tradingPairs.id, id))
      .returning();
    return pair || undefined;
  }

  async getTransactions(userAddress?: string): Promise<Transaction[]> {
    if (userAddress) {
      return await db.select().from(transactions).where(eq(transactions.userAddress, userAddress));
    }
    return await db.select().from(transactions);
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db
      .insert(transactions)
      .values(insertTransaction)
      .returning();
    return transaction;
  }

  async updateTransactionStatus(id: number, status: Transaction["status"]): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  async getLiquidityPools(): Promise<LiquidityPool[]> {
    return await db.select().from(liquidityPools);
  }

  async getLiquidityPoolById(id: number): Promise<LiquidityPool | undefined> {
    const [pool] = await db.select().from(liquidityPools).where(eq(liquidityPools.id, id));
    return pool || undefined;
  }

  async createLiquidityPool(insertPool: InsertLiquidityPool): Promise<LiquidityPool> {
    const [pool] = await db
      .insert(liquidityPools)
      .values(insertPool)
      .returning();
    return pool;
  }

  async updateLiquidityPool(id: number, poolUpdate: Partial<InsertLiquidityPool>): Promise<LiquidityPool | undefined> {
    const [pool] = await db
      .update(liquidityPools)
      .set(poolUpdate)
      .where(eq(liquidityPools.id, id))
      .returning();
    return pool || undefined;
  }

  // LP Token operations
  async getLpTokens(): Promise<LpToken[]> {
    return await db.select().from(lpTokens);
  }

  async getLpTokenById(id: number): Promise<LpToken | undefined> {
    const [lpToken] = await db.select().from(lpTokens).where(eq(lpTokens.id, id));
    return lpToken || undefined;
  }

  async getLpTokenByPairId(pairId: number): Promise<LpToken | undefined> {
    const [lpToken] = await db.select().from(lpTokens).where(eq(lpTokens.pairId, pairId));
    return lpToken || undefined;
  }

  async createLpToken(insertLpToken: InsertLpToken): Promise<LpToken> {
    const [lpToken] = await db
      .insert(lpTokens)
      .values(insertLpToken)
      .returning();
    return lpToken;
  }

  async updateLpToken(id: number, lpTokenUpdate: Partial<InsertLpToken>): Promise<LpToken | undefined> {
    const [lpToken] = await db
      .update(lpTokens)
      .set(lpTokenUpdate)
      .where(eq(lpTokens.id, id))
      .returning();
    return lpToken || undefined;
  }

  // LP Token Holdings operations
  async getLpTokenHoldings(userAddress?: string): Promise<LpTokenHolding[]> {
    if (userAddress) {
      return await db.select().from(lpTokenHoldings).where(eq(lpTokenHoldings.userAddress, userAddress));
    }
    return await db.select().from(lpTokenHoldings);
  }

  async getLpTokenHoldingById(id: number): Promise<LpTokenHolding | undefined> {
    const [holding] = await db.select().from(lpTokenHoldings).where(eq(lpTokenHoldings.id, id));
    return holding || undefined;
  }

  async getLpTokenHoldingByUserAndToken(userAddress: string, lpTokenId: number): Promise<LpTokenHolding | undefined> {
    const [holding] = await db.select()
      .from(lpTokenHoldings)
      .where(and(eq(lpTokenHoldings.userAddress, userAddress), eq(lpTokenHoldings.lpTokenId, lpTokenId)));
    return holding || undefined;
  }

  async createLpTokenHolding(insertHolding: InsertLpTokenHolding): Promise<LpTokenHolding> {
    const [holding] = await db
      .insert(lpTokenHoldings)
      .values(insertHolding)
      .returning();
    return holding;
  }

  async updateLpTokenHolding(id: number, holdingUpdate: Partial<InsertLpTokenHolding>): Promise<LpTokenHolding | undefined> {
    const [holding] = await db
      .update(lpTokenHoldings)
      .set({ ...holdingUpdate, updatedAt: new Date() })
      .where(eq(lpTokenHoldings.id, id))
      .returning();
    return holding || undefined;
  }

  // LP Rewards operations
  async getLpRewards(userAddress?: string): Promise<LpReward[]> {
    if (userAddress) {
      return await db.select().from(lpRewards).where(eq(lpRewards.userAddress, userAddress));
    }
    return await db.select().from(lpRewards);
  }

  async getLpRewardById(id: number): Promise<LpReward | undefined> {
    const [reward] = await db.select().from(lpRewards).where(eq(lpRewards.id, id));
    return reward || undefined;
  }

  async getUnclaimedLpRewards(userAddress: string): Promise<LpReward[]> {
    return await db.select()
      .from(lpRewards)
      .where(and(eq(lpRewards.userAddress, userAddress), eq(lpRewards.claimed, false)));
  }

  async createLpReward(insertReward: InsertLpReward): Promise<LpReward> {
    const [reward] = await db
      .insert(lpRewards)
      .values(insertReward)
      .returning();
    return reward;
  }

  async updateLpReward(id: number, rewardUpdate: Partial<InsertLpReward>): Promise<LpReward | undefined> {
    const [reward] = await db
      .update(lpRewards)
      .set(rewardUpdate)
      .where(eq(lpRewards.id, id))
      .returning();
    return reward || undefined;
  }

  // LP Staking Pool operations
  async getLpStakingPools(): Promise<LpStakingPool[]> {
    return await db.select().from(lpStakingPools);
  }

  async getLpStakingPoolById(id: number): Promise<LpStakingPool | undefined> {
    const [pool] = await db.select().from(lpStakingPools).where(eq(lpStakingPools.id, id));
    return pool || undefined;
  }

  async getLpStakingPoolByLpTokenId(lpTokenId: number): Promise<LpStakingPool | undefined> {
    const [pool] = await db.select().from(lpStakingPools).where(eq(lpStakingPools.lpTokenId, lpTokenId));
    return pool || undefined;
  }

  async createLpStakingPool(insertPool: InsertLpStakingPool): Promise<LpStakingPool> {
    const [pool] = await db
      .insert(lpStakingPools)
      .values(insertPool)
      .returning();
    return pool;
  }

  async updateLpStakingPool(id: number, poolUpdate: Partial<InsertLpStakingPool>): Promise<LpStakingPool | undefined> {
    const [pool] = await db
      .update(lpStakingPools)
      .set(poolUpdate)
      .where(eq(lpStakingPools.id, id))
      .returning();
    return pool || undefined;
  }
}

export const storage = new DatabaseStorage();