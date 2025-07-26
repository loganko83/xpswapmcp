import { Router } from "express";
import { SecurityUtils } from "./common.js";
import { 
  rateLimiters, 
  validators, 
  handleValidationErrors,
  sanitizeSQLInput 
} from "../middleware/security.js";

const router = Router();

// Market data
router.get("/market-stats", async (req, res) => {
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

    let xpPrice = 0.016571759599689175; // Fallback price
    if (response.ok) {
      const data = await response.json();
      xpPrice = data.data?.['36056']?.quote?.USD?.price || xpPrice;
    }

    res.json({
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
    });
  } catch (error) {
    console.error("Failed to fetch market stats:", error);
    res.status(500).json({ error: "Failed to fetch market statistics" });
  }
});

// XP token price
router.get("/xp-price", async (req, res) => {
  try {
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
      
      res.json({
        price,
        change24h,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error("CoinMarketCap API error");
    }
  } catch (error) {
    console.error("Failed to fetch XP price:", error);
    res.json({
      price: 0.016571759599689175,
      change24h: 0,
      timestamp: new Date().toISOString()
    });
  }
});

// Calculate swap quote
router.post("/swap/quote", 
  // rateLimiters.trading,
  // validators.swap,
  // handleValidationErrors,
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
      route: [fromToken, toToken],
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

export default router;
