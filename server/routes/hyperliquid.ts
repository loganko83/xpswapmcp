import { Router } from 'express';
import { db, sqliteDb } from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const router = Router();

// Generate cryptographically secure random number (0-1)
const secureRandom = () => {
  if (typeof crypto !== 'undefined' && crypto.randomBytes) {
    return crypto.randomBytes(4).readUInt32BE(0) / 0xFFFFFFFF;
  }
  return Math.random(); // Fallback for compatibility
};

// Mock data for Hyperliquid-style perpetual contracts
const HYPERLIQUID_CONTRACTS = [
  {
    symbol: 'XP-PERP',
    baseAsset: 'XP',
    quoteAsset: 'USDC',
    maxLeverage: 100,
    minOrderSize: 0.01,
    tickSize: 0.0001,
    stepSize: 0.01,
    maintenanceMarginRate: 0.005, // 0.5%
    takerFeeRate: 0.0005, // 0.05%
    makerFeeRate: -0.00025, // -0.025% (rebate)
  },
  {
    symbol: 'XPS-PERP',
    baseAsset: 'XPS',
    quoteAsset: 'USDC',
    maxLeverage: 50,
    minOrderSize: 0.1,
    tickSize: 0.00001,
    stepSize: 0.1,
    maintenanceMarginRate: 0.01, // 1%
    takerFeeRate: 0.0005,
    makerFeeRate: -0.00025,
  },
  {
    symbol: 'BTC-PERP',
    baseAsset: 'BTC',
    quoteAsset: 'USDC',
    maxLeverage: 125,
    minOrderSize: 0.001,
    tickSize: 0.1,
    stepSize: 0.001,
    maintenanceMarginRate: 0.004, // 0.4%
    takerFeeRate: 0.0005,
    makerFeeRate: -0.00025,
  },
  {
    symbol: 'ETH-PERP',
    baseAsset: 'ETH',
    quoteAsset: 'USDC',
    maxLeverage: 100,
    minOrderSize: 0.01,
    tickSize: 0.01,
    stepSize: 0.01,
    maintenanceMarginRate: 0.0045, // 0.45%
    takerFeeRate: 0.0005,
    makerFeeRate: -0.00025,
  }
];

// Generate realistic price data
const generatePriceData = (basePrice: number, volatility: number = 0.02) => {
  const change = (secureRandom() - 0.5) * 2 * volatility;
  return basePrice * (1 + change);
};

// Generate order book data
const generateOrderBook = (midPrice: number, spread: number = 0.0002) => {
  const bids = [];
  const asks = [];
  
  let totalBidSize = 0;
  let totalAskSize = 0;
  
  // Generate bids (buy orders)
  for (let i = 0; i < 20; i++) {
    const price = midPrice * (1 - spread/2 - (i * spread/10));
    const size = (1 + secureRandom() * 5) * (1 - i * 0.1);
    totalBidSize += size;
    
    bids.push({
      price: parseFloat(price.toFixed(4)),
      size: parseFloat(size.toFixed(2)),
      total: parseFloat(totalBidSize.toFixed(2))
    });
  }
  
  // Generate asks (sell orders)
  for (let i = 0; i < 20; i++) {
    const price = midPrice * (1 + spread/2 + (i * spread/10));
    const size = (1 + secureRandom() * 5) * (1 - i * 0.1);
    totalAskSize += size;
    
    asks.push({
      price: parseFloat(price.toFixed(4)),
      size: parseFloat(size.toFixed(2)),
      total: parseFloat(totalAskSize.toFixed(2))
    });
  }
  
  return { bids, asks, lastUpdateId: Date.now() };
};

// GET /api/hyperliquid/contracts - Get all perpetual contracts
router.get('/contracts', async (req, res) => {
  try {
    const basePrice = 0.0165 + (secureRandom() - 0.5) * 0.001;
    
    const contracts = HYPERLIQUID_CONTRACTS.map(contract => {
      let markPrice;
      let volatility;
      
      switch (contract.symbol) {
        case 'XP-PERP':
          markPrice = basePrice;
          volatility = 0.05;
          break;
        case 'XPS-PERP':
          markPrice = basePrice * 1.2;
          volatility = 0.08;
          break;
        case 'BTC-PERP':
          markPrice = 45000 + (secureRandom() - 0.5) * 2000;
          volatility = 0.03;
          break;
        case 'ETH-PERP':
          markPrice = 3200 + (secureRandom() - 0.5) * 200;
          volatility = 0.04;
          break;
        default:
          markPrice = basePrice;
          volatility = 0.05;
      }
      
      const priceChange24h = (secureRandom() - 0.5) * markPrice * 0.1;
      const priceChangePercent24h = (priceChange24h / markPrice) * 100;
      const volume24h = 1000000 + secureRandom() * 5000000;
      const openInterest = 500000 + secureRandom() * 2000000;
      const fundingRate = (secureRandom() - 0.5) * 0.0002; // -0.01% to +0.01%
      
      return {
        ...contract,
        markPrice: parseFloat(markPrice.toFixed(4)),
        indexPrice: parseFloat((markPrice * (1 + (secureRandom() - 0.5) * 0.001)).toFixed(4)),
        lastPrice: parseFloat((markPrice * (1 + (secureRandom() - 0.5) * 0.0005)).toFixed(4)),
        bidPrice: parseFloat((markPrice * 0.9995).toFixed(4)),
        askPrice: parseFloat((markPrice * 1.0005).toFixed(4)),
        oraclePrice: parseFloat((markPrice * (1 + (secureRandom() - 0.5) * 0.0002)).toFixed(4)),
        impactBidPrice: parseFloat((markPrice * 0.999).toFixed(4)),
        impactAskPrice: parseFloat((markPrice * 1.001).toFixed(4)),
        priceChange24h: parseFloat(priceChange24h.toFixed(4)),
        priceChangePercent24h: parseFloat(priceChangePercent24h.toFixed(2)),
        volume24h: Math.floor(volume24h),
        openInterest: Math.floor(openInterest),
        fundingRate: parseFloat(fundingRate.toFixed(6)),
        nextFundingTime: new Date(Date.now() + (8 - (new Date().getHours() % 8)) * 3600000).toISOString(),
      };
    });
    
    res.json(contracts);
  } catch (error) {
    console.error('Error fetching hyperliquid contracts:', error);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  }
});

// GET /api/hyperliquid/orderbook/:symbol - Get order book for a symbol
router.get('/orderbook/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Get current price for the symbol
    let midPrice = 0.0165;
    switch (symbol) {
      case 'XPS-PERP':
        midPrice = 0.0198;
        break;
      case 'BTC-PERP':
        midPrice = 45000;
        break;
      case 'ETH-PERP':
        midPrice = 3200;
        break;
    }
    
    const orderBook = generateOrderBook(midPrice);
    res.json(orderBook);
  } catch (error) {
    console.error('Error fetching order book:', error);
    res.status(500).json({ error: 'Failed to fetch order book' });
  }
});

// GET /api/hyperliquid/positions - Get user positions
router.get('/positions', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.json([]);
    }
    
    // Simulate some positions
    const positions = [
      {
        id: uuidv4(),
        symbol: 'XP-PERP',
        side: 'long',
        size: 1000,
        leverage: 10,
        entryPrice: 0.0160,
        markPrice: 0.0165,
        liquidationPrice: 0.0144,
        unrealizedPnl: 31.25,
        unrealizedPnlPercent: 3.125,
        margin: 16.5,
        maintenanceMargin: 0.825,
        marginRatio: 0.05,
        fundingCost: -0.15,
        timestamp: new Date().toISOString(),
        isolated: false,
        autoAdd: true,
      }
    ];
    
    res.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// GET /api/hyperliquid/trades/:symbol - Get recent trades for a symbol
router.get('/trades/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    let basePrice = 0.0165;
    switch (symbol) {
      case 'XPS-PERP':
        basePrice = 0.0198;
        break;
      case 'BTC-PERP':
        basePrice = 45000;
        break;
      case 'ETH-PERP':
        basePrice = 3200;
        break;
    }
    
    const trades = [];
    const now = Date.now();
    
    for (let i = 0; i < 50; i++) {
      const side = secureRandom() > 0.5 ? 'buy' : 'sell';
      const price = basePrice * (1 + (secureRandom() - 0.5) * 0.002);
      const size = 1 + secureRandom() * 10;
      const timestamp = new Date(now - i * 1000 * (1 + secureRandom() * 10)).toISOString();
      
      trades.push({
        id: uuidv4(),
        symbol,
        side,
        price: parseFloat(price.toFixed(4)),
        size: parseFloat(size.toFixed(2)),
        timestamp,
        fee: parseFloat((price * size * 0.0005).toFixed(4))
      });
    }
    
    res.json(trades.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  } catch (error) {
    console.error('Error fetching trades:', error);
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// GET /api/hyperliquid/chart/:symbol - Get chart data
router.get('/chart/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = '1m', limit = 100 } = req.query;
    
    let basePrice = 0.0165;
    switch (symbol) {
      case 'XPS-PERP':
        basePrice = 0.0198;
        break;
      case 'BTC-PERP':
        basePrice = 45000;
        break;
      case 'ETH-PERP':
        basePrice = 3200;
        break;
    }
    
    const chartData = [];
    const now = Date.now();
    const intervalMs = interval === '1m' ? 60000 : 
                     interval === '5m' ? 300000 :
                     interval === '15m' ? 900000 :
                     interval === '1h' ? 3600000 : 60000;
    
    let currentPrice = basePrice;
    
    for (let i = parseInt(limit.toString()) - 1; i >= 0; i--) {
      const timestamp = now - (i * intervalMs);
      const volatility = 0.005;
      
      const open = currentPrice;
      const change1 = (secureRandom() - 0.5) * 2 * volatility;
      const change2 = (secureRandom() - 0.5) * 2 * volatility;
      const change3 = (secureRandom() - 0.5) * 2 * volatility;
      
      const high = Math.max(open, open * (1 + Math.abs(change1)), open * (1 + Math.abs(change2)), open * (1 + change3));
      const low = Math.min(open, open * (1 - Math.abs(change1)), open * (1 - Math.abs(change2)), open * (1 + change3));
      const close = open * (1 + change3);
      const volume = 1000 + secureRandom() * 5000;
      
      chartData.push({
        timestamp,
        open: parseFloat(open.toFixed(4)),
        high: parseFloat(high.toFixed(4)),
        low: parseFloat(low.toFixed(4)),
        close: parseFloat(close.toFixed(4)),
        volume: Math.floor(volume)
      });
      
      currentPrice = close;
    }
    
    res.json(chartData);
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: 'Failed to fetch chart data' });
  }
});

// POST /api/hyperliquid/order - Place an order
router.post('/order', async (req, res) => {
  try {
    const {
      address,
      symbol,
      side,
      size,
      leverage,
      orderType,
      limitPrice,
      stopPrice,
      reduceOnly,
      marginMode
    } = req.body;
    
    if (!address || !symbol || !side || !size) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Simulate order placement
    const orderId = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Calculate fees
    const price = limitPrice || 0.0165; // Use limit price or market price
    const notionalValue = size * price;
    const feeRate = orderType === 'market' ? 0.0005 : -0.00025; // Taker/Maker fees
    const fee = Math.abs(notionalValue * feeRate);
    
    // Simulate order success (in real implementation, would interact with exchange)
    const order = {
      orderId,
      address,
      symbol,
      side,
      size: parseFloat(size),
      leverage: parseInt(leverage),
      orderType,
      limitPrice: limitPrice ? parseFloat(limitPrice) : null,
      stopPrice: stopPrice ? parseFloat(stopPrice) : null,
      reduceOnly: Boolean(reduceOnly),
      marginMode,
      status: 'filled', // In real implementation, would be 'pending' initially
      fee,
      timestamp,
      txHash: `0x${Array.from({length: 64}, () => Math.floor(secureRandom() * 16).toString(16)).join('')}`
    };
    
    // Store order in database (simplified)
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO hyperliquid_orders (
        order_id, address, symbol, side, size, leverage, order_type,
        limit_price, stop_price, reduce_only, margin_mode, status, fee, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      orderId, address, symbol, side, size, leverage, orderType,
      limitPrice, stopPrice, reduceOnly, marginMode, 'filled', fee, timestamp
    );
    
    res.json(order);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// GET /api/hyperliquid/analytics - Get trading analytics
router.get('/analytics', async (req, res) => {
  try {
    const analytics = {
      volume24h: 125000000 + secureRandom() * 50000000,
      openInterest: 75000000 + secureRandom() * 25000000,
      activeTraders: 1250 + Math.floor(secureRandom() * 500),
      longShortRatio: 0.45 + secureRandom() * 0.1,
      averageLeverage: 8.5 + secureRandom() * 3,
      topTraderPnl: (secureRandom() - 0.5) * 100000,
      liquidations24h: 15000000 + secureRandom() * 10000000,
      fundingRateAvg: (secureRandom() - 0.5) * 0.0001,
    };
    
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Initialize database tables for hyperliquid features
const initializeHyperliquidTables = () => {
  try {
    // Orders table
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS hyperliquid_orders (
        order_id TEXT PRIMARY KEY,
        address TEXT NOT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        size REAL NOT NULL,
        leverage INTEGER NOT NULL,
        order_type TEXT NOT NULL,
        limit_price REAL,
        stop_price REAL,
        reduce_only BOOLEAN DEFAULT FALSE,
        margin_mode TEXT DEFAULT 'cross',
        status TEXT DEFAULT 'pending',
        fee REAL DEFAULT 0,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (address) REFERENCES users (address)
      )
    `);
    
    // Positions table
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS hyperliquid_positions (
        position_id TEXT PRIMARY KEY,
        address TEXT NOT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        size REAL NOT NULL,
        leverage INTEGER NOT NULL,
        entry_price REAL NOT NULL,
        margin REAL NOT NULL,
        isolated BOOLEAN DEFAULT FALSE,
        auto_add BOOLEAN DEFAULT TRUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (address) REFERENCES users (address)
      )
    `);
    
    // Trades table
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS hyperliquid_trades (
        trade_id TEXT PRIMARY KEY,
        order_id TEXT NOT NULL,
        address TEXT NOT NULL,
        symbol TEXT NOT NULL,
        side TEXT NOT NULL,
        size REAL NOT NULL,
        price REAL NOT NULL,
        fee REAL NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES hyperliquid_orders (order_id),
        FOREIGN KEY (address) REFERENCES users (address)
      )
    `);
    
    console.log('Hyperliquid database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing hyperliquid tables:', error);
  }
};

// Initialize tables on module load
initializeHyperliquidTables();

export default router;