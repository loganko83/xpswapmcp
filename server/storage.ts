import { 
  tokens, 
  tradingPairs, 
  transactions, 
  liquidityPools,
  type Token, 
  type InsertToken,
  type TradingPair,
  type InsertTradingPair,
  type Transaction,
  type InsertTransaction,
  type LiquidityPool,
  type InsertLiquidityPool
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

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
}

export const storage = new DatabaseStorage();