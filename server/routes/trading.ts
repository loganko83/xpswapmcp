import { Router } from "express";
import { SecurityUtils } from "./common.js";
import { 
  rateLimiters, 
  validators, 
  handleValidationErrors,
  sanitizeSQLInput 
} from "../middleware/security.js";
import { cache, CACHE_KEYS, CACHE_TTL } from "../services/cache.js";
import { cacheMiddleware, cacheMedium, cacheShort, invalidateCache } from "../middleware/cache.js";

const router = Router();

// Market data with cache middleware
router.get("/market-stats", 
  cacheMiddleware({ 
    ttl: CACHE_TTL.MARKET_STATS,
    key: 'market:stats:overview'
  }),
  async (req, res) => {
    try {
      console.log("📡 Fetching market stats");
      
      // Get real-time XP price from CoinMarketCap
      const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=36056',
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY || "",
          "Accept": "application/json",
        },
      }
    );

    let xpPrice = 0.016571759599689175; // Fallback price
    if (response.ok) {
      const data = await response.json();
      xpPrice = data.data?.['36056']?.quote?.USD?.price || xpPrice;
    }

    const marketStats = {
      totalValueLocked: "32.5K",
      volume24h: "8.75K", 
      totalTrades: 47,
      activePairs: 3,
      xpPrice: xpPrice,
      xpsPrice: 1.0,
      topPairs: [
        {
          pair: "XP/XPS",
          volume: "3.2K",
          price: xpPrice.toFixed(6),
          change: "+2.34%"
        },
        {
          pair: "XP/USDT", 
          volume: "2.8K",
          price: xpPrice.toFixed(6),
          change: "+1.67%"
        },
        {
          pair: "XPS/USDT",
          volume: "2.75K", 
          price: "1.000000",
          change: "0.00%"
        }
      ]
    };
    
    // Middleware will handle caching automatically
    res.json(marketStats);
  } catch (error) {
    console.error("Failed to fetch market stats:", error);
    res.status(500).json({ error: "Failed to fetch market statistics" });
  }
});

// XP token price
router.get("/xp-price", async (req, res) => {
  try {
    // Check cache first
    const cachedPrice = cache.get(CACHE_KEYS.XP_PRICE);
    if (cachedPrice) {
      console.log("🚀 XP Price served from cache");
      return res.json(cachedPrice);
    }
    
    console.log("📡 Fetching XP Price from CoinMarketCap API");
    const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=36056',
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY || "",
          "Accept": "application/json",
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      const price = data.data?.['36056']?.quote?.USD?.price || 0.016571759599689175;
      const change24h = data.data?.['36056']?.quote?.USD?.percent_change_24h || 0;
      
      const priceData = {
        price,
        change24h,
        timestamp: new Date().toISOString()
      };
      
      // Cache the result
      cache.set(CACHE_KEYS.XP_PRICE, priceData, CACHE_TTL.XP_PRICE);
      
      res.json(priceData);
    } else {
      throw new Error("CoinMarketCap API error");
    }
  } catch (error) {
    console.error("Failed to fetch XP price:", error);
    const fallbackData = {
      price: 0.016571759599689175,
      change24h: 0,
      timestamp: new Date().toISOString()
    };
    
    // Cache even the fallback data to prevent hammering the API
    cache.set(CACHE_KEYS.XP_PRICE, fallbackData, CACHE_TTL.XP_PRICE);
    
    res.json(fallbackData);
  }
});

// Calculate swap quote
router.post("/swap/quote", 
  // rateLimiters.trading,
  // validators.swap,
  validators.swap,
  handleValidationErrors,
  async (req, res) => {
  console.log('🚀 Swap quote route reached!');
  console.log('📋 Request body:', req.body);
  console.log('📋 Request headers:', req.headers);
  try {
    const { from, to, amount } = req.body;
    console.log('📥 Received swap quote request:', { from, to, amount, body: req.body });
    
    // Validate inputs exist
    if (!from || !to || !amount) {
      console.log('❌ Missing parameters:', { from, to, amount });
      return res.status(400).json({ error: "Missing required parameters: from, to, amount" });
    }
    
    // Skip sanitization for now - just use the values directly
    console.log('✅ Parameters validated, proceeding with calculation...');
    
    // Define token prices
    const tokenPrices: { [key: string]: number } = {
      'XP': 0.016571759599689175, // Current XP price
      'XPS': 1.0, // XPS fixed at 1 USD
      'ETH': 3200, // Example ETH price
      'BTC': 42000, // Example BTC price
      'USDT': 1.0, // Stablecoin
      'USDC': 1.0, // Stablecoin
      'BNB': 300 // Example BNB price
    };
    
    // Get prices or use default values
    const fromPrice = tokenPrices[from.toUpperCase()] || 1.0;
    const toPrice = tokenPrices[to.toUpperCase()] || 1.0;
    const inputAmount = parseFloat(amount);
    
    if (inputAmount <= 0) {
      throw new Error("Invalid amount");
    }
    
    // Calculate output amount with 0.3% fee
    const outputAmount = (inputAmount * fromPrice / toPrice) * 0.997;
    const priceImpact = "0.15"; // Mock price impact
    const minimumReceived = outputAmount * 0.995; // 0.5% slippage tolerance
    
    res.json({
      inputAmount: amount,
      outputAmount: outputAmount.toFixed(6),
      priceImpact,
      minimumReceived: minimumReceived.toFixed(6),
      route: [from, to],
      gasEstimate: "0.002"
    });
  } catch (error) {
    console.error("Failed to calculate swap quote:", error);
    res.status(500).json({ error: "Failed to calculate swap quote" });
  }
});

// Execute swap
router.post("/swap/execute", async (req, res) => {
  try {
    const { from, to, amount, slippage = 0.5 } = req.body;
    
    if (!from || !to || !amount) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    
    // Simulate swap execution
    const txHash = SecurityUtils.generateTxHash();
    const timestamp = Date.now();
    
    res.json({
      success: true,
      transactionHash: txHash,
      fromToken,
      toToken,
      inputAmount: amount,
      outputAmount: (parseFloat(amount) * 0.997).toFixed(6),
      gasUsed: "0.002",
      timestamp
    });
  } catch (error) {
    console.error("Swap execution error:", error);
    res.status(500).json({ error: "Failed to execute swap" });
  }
});

// Token balance
router.get("/token-balance/:address/:token", async (req, res) => {
  try {
    const { address, token } = req.params;
    
    if (!address || !token) {
      return res.status(400).json({ error: "Missing address or token" });
    }
    
    // Simulate balance retrieval
    const balance = (SecurityUtils.getSecureRandomFloat() * 10000).toFixed(6);
    const tokenSymbol = token.toUpperCase();
    
    res.json({ 
      balance, 
      symbol: tokenSymbol,
      address,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Failed to fetch token balance:", error);
    res.status(500).json({ error: "Failed to fetch token balance" });
  }
});

// Crypto ticker data
router.get("/crypto-ticker", async (req, res) => {
  try {
    // Get real-time XP price from CoinMarketCap
    const response = await fetch(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=36056',
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.COINMARKETCAP_API_KEY || "",
          "Accept": "application/json",
        },
      }
    );

    let xpPrice = 0.014134482823113205; // Fallback price
    let xpChange = -0.80802801; // Fallback change
    
    if (response.ok) {
      const data = await response.json();
      xpPrice = data.data?.['36056']?.quote?.USD?.price || xpPrice;
      xpChange = data.data?.['36056']?.quote?.USD?.percent_change_24h || xpChange;
    }

    // Mock ticker data for other cryptos with realistic prices
    const tickers = [
      {
        id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        price: 96420,
        change24h: 1.2,
        iconUrl: "https://assets.coingecko.com/coins/images/1/thumb/bitcoin.png"
      },
      {
        id: "ethereum", 
        symbol: "ETH",
        name: "Ethereum",
        price: 3340,
        change24h: 2.1,
        iconUrl: "https://assets.coingecko.com/coins/images/279/thumb/ethereum.png"
      },
      {
        id: "binancecoin",
        symbol: "BNB", 
        name: "BNB",
        price: 693,
        change24h: -0.5,
        iconUrl: "https://assets.coingecko.com/coins/images/825/thumb/bnb-icon2_2x.png"
      },
      {
        id: "solana",
        symbol: "SOL",
        name: "Solana", 
        price: 185,
        change24h: 3.2,
        iconUrl: "https://assets.coingecko.com/coins/images/4128/thumb/solana.png"
      },
      {
        id: "dogecoin",
        symbol: "DOGE",
        name: "Dogecoin",
        price: 0.32,
        change24h: -1.1,
        iconUrl: "https://assets.coingecko.com/coins/images/5/thumb/dogecoin.png"
      },
      {
        id: "xphere",
        symbol: "XP",
        name: "Xphere",
        price: xpPrice,
        change24h: xpChange,
        iconUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png"
      }
    ];

    res.json({ tickers });
  } catch (error) {
    console.error("Failed to fetch crypto ticker:", error);
    res.status(500).json({ error: "Failed to fetch crypto ticker data" });
  }
});

// Trading pairs
router.get("/trading-pairs", async (req, res) => {
  try {
    // Simulate trading pairs with real-time data
    const pairs = [
      {
        pair: "XPS/XP",
        baseToken: "XPS",
        quoteToken: "XP", 
        price: (1.0 / 0.016571759599689175).toFixed(6),
        volume24h: "3200",
        change24h: "+2.34%",
        high24h: "65.5",
        low24h: "58.2",
        liquidity: "125000"
      },
      {
        pair: "XP/USDT",
        baseToken: "XP", 
        quoteToken: "USDT",
        price: "0.016572",
        volume24h: "2800",
        change24h: "+1.67%",
        high24h: "0.0172",
        low24h: "0.0158",
        liquidity: "89000"
      },
      {
        pair: "XPS/USDT",
        baseToken: "XPS",
        quoteToken: "USDT",
        price: "1.000000", 
        volume24h: "2750",
        change24h: "0.00%",
        high24h: "1.005",
        low24h: "0.995",
        liquidity: "67000"
      }
    ];
    
    res.json(pairs);
  } catch (error) {
    console.error("Failed to fetch trading pairs:", error);
    res.status(500).json({ error: "Failed to fetch trading pairs" });
  }
});

// Get tokens for different networks
router.get("/xphere-tokens", async (req, res) => {
  try {
    const tokens = [
      {
        id: 1,
        symbol: "XP",
        name: "Xphere",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/36056.png",
        balance: "0",
        price: 0.016641808997191483,
        isActive: true
      },
      {
        id: 2,
        symbol: "XPS",
        name: "XPSwap Token",
        address: "0x1234567890123456789012345678901234567890",
        decimals: 18,
        logoUrl: "/xps-logo.png",
        balance: "0",
        price: 1.0,
        isActive: true
      },
      {
        id: 3,
        symbol: "USDT",
        name: "Tether USD",
        address: "0x6485cc42b36b4c982d3f1b6ec42b92007fb0b596",
        decimals: 18,
        logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
        balance: "0",
        price: 1.0,
        isActive: true
      },
      {
        id: 4,
        symbol: "XCR",
        name: "XCrypto",
        address: "0x2345678901234567890123456789012345678901",
        decimals: 18,
        logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
        balance: "0",
        price: 0.05,
        isActive: true
      },
      {
        id: 5,
        symbol: "XEF",
        name: "XEfficient",
        address: "0x3456789012345678901234567890123456789012",
        decimals: 18,
        logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
        balance: "0",
        price: 0.02,
        isActive: true
      }
    ];
    
    res.json(tokens);
  } catch (error) {
    console.error("Failed to fetch Xphere tokens:", error);
    res.status(500).json({ error: "Failed to fetch tokens" });
  }
});

router.get("/ethereum-tokens", async (req, res) => {
  try {
    const tokens = [
      {
        id: 1,
        symbol: "ETH",
        name: "Ethereum",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
        balance: "0",
        price: 2251.45,
        isActive: true
      },
      {
        id: 2,
        symbol: "USDT",
        name: "Tether USD",
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        decimals: 6,
        logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
        balance: "0",
        price: 1.0,
        isActive: true
      },
      {
        id: 3,
        symbol: "USDC",
        name: "USD Coin",
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        decimals: 6,
        logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
        balance: "0",
        price: 1.0,
        isActive: true
      }
    ];
    
    res.json(tokens);
  } catch (error) {
    console.error("Failed to fetch Ethereum tokens:", error);
    res.status(500).json({ error: "Failed to fetch tokens" });
  }
});

router.get("/bsc-tokens", async (req, res) => {
  try {
    const tokens = [
      {
        id: 1,
        symbol: "BNB",
        name: "Binance Coin",
        address: "0x0000000000000000000000000000000000000000",
        decimals: 18,
        logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/1839.png",
        balance: "0",
        price: 312.87,
        isActive: true
      },
      {
        id: 2,
        symbol: "USDT",
        name: "Tether USD",
        address: "0x55d398326f99059ff775485246999027b3197955",
        decimals: 18,
        logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/825.png",
        balance: "0",
        price: 1.0,
        isActive: true
      },
      {
        id: 3,
        symbol: "BUSD",
        name: "Binance USD",
        address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        decimals: 18,
        logoUrl: "https://s2.coinmarketcap.com/static/img/coins/64x64/4687.png",
        balance: "0",
        price: 1.0,
        isActive: true
      }
    ];
    
    res.json(tokens);
  } catch (error) {
    console.error("Failed to fetch BSC tokens:", error);
    res.status(500).json({ error: "Failed to fetch tokens" });
  }
});

export default router;
