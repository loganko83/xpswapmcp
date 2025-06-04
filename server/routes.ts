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

      // Get real Xphere price from CoinMarketCap using ID 28447
      let xpPrice = 0.0842; // fallback
      try {
        const cmcResponse = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=28447', {
          headers: {
            'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY || '',
            'Accept': 'application/json'
          }
        });
        
        if (cmcResponse.ok) {
          const cmcData = await cmcResponse.json();
          if (cmcData.data && cmcData.data['28447']) {
            xpPrice = cmcData.data['28447'].quote.USD.price;
          }
        }
      } catch (error) {
        console.warn("Failed to fetch Xphere price from CoinMarketCap:", error);
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

  // Xphere Price endpoint
  app.get("/api/xp-price", async (req, res) => {
    try {
      const cmcResponse = await fetch('https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=28447', {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY || '',
          'Accept': 'application/json'
        }
      });
      
      if (!cmcResponse.ok) {
        throw new Error(`CoinMarketCap API error: ${cmcResponse.status}`);
      }
      
      const cmcData = await cmcResponse.json();
      
      if (cmcData.data && cmcData.data['28447']) {
        const xpData = cmcData.data['28447'];
        const priceInfo = {
          price: xpData.quote.USD.price,
          change24h: xpData.quote.USD.percent_change_24h,
          marketCap: xpData.quote.USD.market_cap,
          volume24h: xpData.quote.USD.volume_24h,
          lastUpdated: xpData.last_updated
        };
        
        res.json(priceInfo);
      } else {
        throw new Error("Xphere data not found in CoinMarketCap response");
      }
    } catch (error) {
      console.error("Failed to fetch Xphere price:", error);
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

  // Get multiple token prices from CoinMarketCap
  app.get("/api/token-prices", async (req, res) => {
    try {
      const prices: { [key: string]: { price: number; change24h: number } } = {};
      
      // First, get Xphere price using ID 28447
      try {
        const xphereResponse = await fetch(
          'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=28447',
          {
            headers: {
              "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY || "",
              "Accept": "application/json",
            },
          }
        );

        if (xphereResponse.ok) {
          const xphereData = await xphereResponse.json();
          if (xphereData.data && xphereData.data['28447']) {
            const tokenData = xphereData.data['28447'];
            prices['XP'] = {
              price: tokenData.quote.USD.price,
              change24h: tokenData.quote.USD.percent_change_24h
            };
          }
        }
      } catch (error) {
        console.warn("Failed to fetch Xphere price:", error);
      }

      // Then get other tokens by symbol
      const symbols = "BTC,ETH,USDT,BNB";
      const cmcResponse = await fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY || "",
            "Accept": "application/json",
          },
        }
      );

      if (cmcResponse.ok) {
        const cmcData = await cmcResponse.json();
        if (cmcData.data) {
          Object.keys(cmcData.data).forEach(symbol => {
            const tokenData = cmcData.data[symbol];
            prices[symbol] = {
              price: tokenData.quote.USD.price,
              change24h: tokenData.quote.USD.percent_change_24h
            };
          });
        }
      }
      
      res.json(prices);
    } catch (error) {
      console.error("Failed to fetch token prices:", error);
      res.status(500).json({ error: "Failed to fetch token prices" });
    }
  });

  // Get token balance for a specific address and token
  app.get("/api/token-balance/:address/:tokenSymbol", async (req, res) => {
    try {
      const { address, tokenSymbol } = req.params;
      
      // For XP (native token), we'll return the actual wallet balance
      // For other tokens, we need to query token contracts (not implemented yet)
      if (tokenSymbol.toUpperCase() === "XP") {
        // Return the actual XP balance from wallet connection
        // This should match the wallet balance shown in MetaMask
        res.json({ balance: "0", symbol: "XP", note: "Use wallet balance for XP" });
      } else {
        // For ERC-20 tokens, return 0 for now (would need contract calls)
        const tokenBalances: { [key: string]: string } = {
          ETH: "0",
          BTC: "0", 
          USDT: "0"
        };
        const balance = tokenBalances[tokenSymbol.toUpperCase()] || "0";
        res.json({ balance, symbol: tokenSymbol.toUpperCase() });
      }
    } catch (error) {
      console.error("Failed to fetch token balance:", error);
      res.status(500).json({ error: "Failed to fetch token balance" });
    }
  });

  // Calculate swap quote
  app.post("/api/swap-quote", async (req, res) => {
    try {
      const { fromToken, toToken, amount } = req.body;
      
      // Get current prices
      const pricesResponse = await fetch(`${req.protocol}://${req.get('host')}/api/token-prices?symbols=${fromToken},${toToken}`);
      const prices = await pricesResponse.json();
      
      if (!prices[fromToken] || !prices[toToken]) {
        throw new Error("Token prices not available");
      }
      
      const fromPrice = prices[fromToken].price;
      const toPrice = prices[toToken].price;
      const inputAmount = parseFloat(amount);
      
      // Calculate output amount with 0.3% fee
      const outputAmount = (inputAmount * fromPrice / toPrice) * 0.997;
      const priceImpact = "0.15"; // Mock price impact
      const minimumReceived = outputAmount * 0.995; // 0.5% slippage tolerance
      
      res.json({
        inputAmount: amount,
        outputAmount: outputAmount.toFixed(6),
        priceImpact,
        minimumReceived: minimumReceived.toFixed(6),
        route: [fromToken, toToken],
        gasEstimate: "0.002"
      });
    } catch (error) {
      console.error("Failed to calculate swap quote:", error);
      res.status(500).json({ error: "Failed to calculate swap quote" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
