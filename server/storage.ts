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

export class MemStorage implements IStorage {
  private tokens: Map<number, Token>;
  private tradingPairs: Map<number, TradingPair>;
  private transactions: Map<number, Transaction>;
  private liquidityPools: Map<number, LiquidityPool>;
  private currentTokenId: number;
  private currentTradingPairId: number;
  private currentTransactionId: number;
  private currentLiquidityPoolId: number;

  constructor() {
    this.tokens = new Map();
    this.tradingPairs = new Map();
    this.transactions = new Map();
    this.liquidityPools = new Map();
    this.currentTokenId = 1;
    this.currentTradingPairId = 1;
    this.currentTransactionId = 1;
    this.currentLiquidityPoolId = 1;

    // Initialize with default tokens
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Default tokens
    const defaultTokens = [
      {
        symbol: "XP",
        name: "Xphere",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        logoUrl: "",
        isActive: true,
      },
      {
        symbol: "USDT",
        name: "Tether USD",
        address: "0x1234567890123456789012345678901234567890",
        decimals: 6,
        logoUrl: "",
        isActive: true,
      },
      {
        symbol: "ETH",
        name: "Ethereum",
        address: "0x2345678901234567890123456789012345678901",
        decimals: 18,
        logoUrl: "",
        isActive: true,
      },
      {
        symbol: "BNB",
        name: "Binance Coin",
        address: "0x3456789012345678901234567890123456789012",
        decimals: 18,
        logoUrl: "",
        isActive: true,
      },
    ];

    for (const tokenData of defaultTokens) {
      await this.createToken(tokenData);
    }
  }

  // Token operations
  async getTokens(): Promise<Token[]> {
    return Array.from(this.tokens.values()).filter(token => token.isActive);
  }

  async getTokenById(id: number): Promise<Token | undefined> {
    return this.tokens.get(id);
  }

  async getTokenBySymbol(symbol: string): Promise<Token | undefined> {
    return Array.from(this.tokens.values()).find(token => token.symbol === symbol);
  }

  async createToken(insertToken: InsertToken): Promise<Token> {
    const id = this.currentTokenId++;
    const token: Token = {
      ...insertToken,
      id,
      createdAt: new Date(),
    };
    this.tokens.set(id, token);
    return token;
  }

  async updateToken(id: number, tokenUpdate: Partial<InsertToken>): Promise<Token | undefined> {
    const existingToken = this.tokens.get(id);
    if (!existingToken) return undefined;

    const updatedToken = { ...existingToken, ...tokenUpdate };
    this.tokens.set(id, updatedToken);
    return updatedToken;
  }

  // Trading pair operations
  async getTradingPairs(): Promise<TradingPair[]> {
    return Array.from(this.tradingPairs.values()).filter(pair => pair.isActive);
  }

  async getTradingPairById(id: number): Promise<TradingPair | undefined> {
    return this.tradingPairs.get(id);
  }

  async createTradingPair(insertPair: InsertTradingPair): Promise<TradingPair> {
    const id = this.currentTradingPairId++;
    const pair: TradingPair = {
      ...insertPair,
      id,
      createdAt: new Date(),
    };
    this.tradingPairs.set(id, pair);
    return pair;
  }

  async updateTradingPair(id: number, pairUpdate: Partial<InsertTradingPair>): Promise<TradingPair | undefined> {
    const existingPair = this.tradingPairs.get(id);
    if (!existingPair) return undefined;

    const updatedPair = { ...existingPair, ...pairUpdate };
    this.tradingPairs.set(id, updatedPair);
    return updatedPair;
  }

  // Transaction operations
  async getTransactions(userAddress?: string): Promise<Transaction[]> {
    const allTransactions = Array.from(this.transactions.values());
    if (userAddress) {
      return allTransactions.filter(tx => tx.userAddress.toLowerCase() === userAddress.toLowerCase());
    }
    return allTransactions;
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const transaction: Transaction = {
      ...insertTransaction,
      id,
      createdAt: new Date(),
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransactionStatus(id: number, status: Transaction["status"]): Promise<Transaction | undefined> {
    const existingTransaction = this.transactions.get(id);
    if (!existingTransaction) return undefined;

    const updatedTransaction = { ...existingTransaction, status };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  // Liquidity pool operations
  async getLiquidityPools(): Promise<LiquidityPool[]> {
    return Array.from(this.liquidityPools.values()).filter(pool => pool.isActive);
  }

  async getLiquidityPoolById(id: number): Promise<LiquidityPool | undefined> {
    return this.liquidityPools.get(id);
  }

  async createLiquidityPool(insertPool: InsertLiquidityPool): Promise<LiquidityPool> {
    const id = this.currentLiquidityPoolId++;
    const pool: LiquidityPool = {
      ...insertPool,
      id,
      createdAt: new Date(),
    };
    this.liquidityPools.set(id, pool);
    return pool;
  }

  async updateLiquidityPool(id: number, poolUpdate: Partial<InsertLiquidityPool>): Promise<LiquidityPool | undefined> {
    const existingPool = this.liquidityPools.get(id);
    if (!existingPool) return undefined;

    const updatedPool = { ...existingPool, ...poolUpdate };
    this.liquidityPools.set(id, updatedPool);
    return updatedPool;
  }
}

export const storage = new MemStorage();
