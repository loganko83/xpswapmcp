import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertTokenSchema, insertTradingPairSchema, insertTransactionSchema, insertLiquidityPoolSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Token routes
  app.get("/api/tokens", async (req, res) => {
    try {
      const tokens = await storage.getTokens();
      res.json(tokens);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tokens" });
    }
  });

  app.get("/api/tokens/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid token ID" });
      }

      const token = await storage.getTokenById(id);
      if (!token) {
        return res.status(404).json({ message: "Token not found" });
      }

      res.json(token);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch token" });
    }
  });

  app.post("/api/tokens", async (req, res) => {
    try {
      const validationResult = insertTokenSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid token data", 
          errors: validationResult.error.errors 
        });
      }

      const token = await storage.createToken(validationResult.data);
      res.status(201).json(token);
    } catch (error) {
      res.status(500).json({ message: "Failed to create token" });
    }
  });

  // Trading pairs routes
  app.get("/api/pairs", async (req, res) => {
    try {
      const pairs = await storage.getTradingPairs();
      
      // Enrich with token information
      const enrichedPairs = await Promise.all(
        pairs.map(async (pair) => {
          const tokenA = await storage.getTokenById(pair.tokenAId);
          const tokenB = await storage.getTokenById(pair.tokenBId);
          
          return {
            ...pair,
            tokenA,
            tokenB,
          };
        })
      );

      res.json(enrichedPairs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trading pairs" });
    }
  });

  app.get("/api/pairs/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid pair ID" });
      }

      const pair = await storage.getTradingPairById(id);
      if (!pair) {
        return res.status(404).json({ message: "Trading pair not found" });
      }

      const tokenA = await storage.getTokenById(pair.tokenAId);
      const tokenB = await storage.getTokenById(pair.tokenBId);

      res.json({
        ...pair,
        tokenA,
        tokenB,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trading pair" });
    }
  });

  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const userAddress = req.query.userAddress as string;
      const transactions = await storage.getTransactions(userAddress);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const validationResult = insertTransactionSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Invalid transaction data", 
          errors: validationResult.error.errors 
        });
      }

      const transaction = await storage.createTransaction(validationResult.data);
      res.status(201).json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      const { status } = req.body;
      if (!["pending", "confirmed", "failed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const transaction = await storage.updateTransactionStatus(id, status);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }

      res.json(transaction);
    } catch (error) {
      res.status(500).json({ message: "Failed to update transaction status" });
    }
  });

  // Liquidity pools routes
  app.get("/api/pools", async (req, res) => {
    try {
      const pools = await storage.getLiquidityPools();
      
      // Enrich with pair and token information
      const enrichedPools = await Promise.all(
        pools.map(async (pool) => {
          const pair = await storage.getTradingPairById(pool.pairId);
          if (!pair) return pool;

          const tokenA = await storage.getTokenById(pair.tokenAId);
          const tokenB = await storage.getTokenById(pair.tokenBId);
          
          return {
            ...pool,
            pair: {
              ...pair,
              tokenA,
              tokenB,
            },
          };
        })
      );

      res.json(enrichedPools);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch liquidity pools" });
    }
  });

  // Market stats endpoint
  app.get("/api/stats", async (req, res) => {
    try {
      const pairs = await storage.getTradingPairs();
      const pools = await storage.getLiquidityPools();

      // Calculate aggregated stats
      const totalValueLocked = pools.reduce((sum, pool) => {
        return sum + parseFloat(pool.totalLiquidity);
      }, 0);

      const volume24h = pairs.reduce((sum, pair) => {
        return sum + parseFloat(pair.volume24h);
      }, 0);

      const activePairs = pairs.filter(pair => pair.isActive).length;

      // Mock XP price and other stats
      const stats = {
        totalValueLocked: totalValueLocked.toString(),
        volume24h: volume24h.toString(),
        activePairs,
        xpPrice: "0.0842",
        marketCap: "45200000",
        circulatingSupply: "537000000",
        high24h: "0.0865",
        low24h: "0.0798",
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch market stats" });
    }
  });

  // Quote endpoint for swap calculations
  app.post("/api/quote", async (req, res) => {
    try {
      const { fromToken, toToken, amount } = req.body;

      if (!fromToken || !toToken || !amount) {
        return res.status(400).json({ message: "Missing required parameters" });
      }

      // Get real XP price from CoinMarketCap
      let xpPrice = 0.0842; // fallback
      try {
        const cmcResponse = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=XP', {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY || '',
            'Accept': 'application/json'
          }
        });
        
        if (cmcResponse.ok) {
          const cmcData = await cmcResponse.json();
          if (cmcData.data && cmcData.data.XP) {
            xpPrice = cmcData.data.XP.quote.USD.price;
          }
        }
      } catch (error) {
        console.warn("Failed to fetch XP price from CoinMarketCap:", error);
      }

      // Calculate exchange rate based on real price
      const mockExchangeRate = fromToken === "XP" ? xpPrice : 1 / xpPrice;
      const outputAmount = (parseFloat(amount) * mockExchangeRate).toFixed(6);
      const slippage = 0.5; // 0.5%

      const quote = {
        inputAmount: amount,
        outputAmount,
        priceImpact: "0.1",
        minimumReceived: (parseFloat(outputAmount) * (1 - slippage / 100)).toFixed(6),
        route: [fromToken, toToken],
        gasEstimate: "0.02",
      };

      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate quote" });
    }
  });

  // XP Price endpoint
  app.get("/api/xp-price", async (req, res) => {
    try {
      const cmcResponse = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=XP', {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY || '',
          'Accept': 'application/json'
        }
      });
      
      if (!cmcResponse.ok) {
        throw new Error(`CoinMarketCap API error: ${cmcResponse.status}`);
      }
      
      const cmcData = await cmcResponse.json();
      
      if (cmcData.data && cmcData.data.XP) {
        const xpData = cmcData.data.XP;
        const priceInfo = {
          price: xpData.quote.USD.price,
          change24h: xpData.quote.USD.percent_change_24h,
          marketCap: xpData.quote.USD.market_cap,
          volume24h: xpData.quote.USD.volume_24h,
          lastUpdated: xpData.last_updated
        };
        
        res.json(priceInfo);
      } else {
        throw new Error("XP data not found in CoinMarketCap response");
      }
    } catch (error) {
      console.error("Failed to fetch XP price:", error);
      // Return fallback data
      res.json({
        price: 0.0842,
        change24h: 2.1,
        marketCap: 45200000,
        volume24h: 2800000,
        lastUpdated: new Date().toISOString()
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
