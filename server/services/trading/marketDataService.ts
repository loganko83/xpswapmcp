import { cache, CACHE_KEYS, CACHE_TTL } from "../cache";
import { BlockchainService } from "../realBlockchain";

export interface MarketStats {
  totalValueLocked: string;
  volume24h: string;
  totalTrades: number;
  activePairs: number;
  xpPrice: number;
  xpsPrice: number;
  topPairs: Array<{
    pair: string;
    volume: string;
    price: string;
    change: string;
  }>;
}

export interface PriceData {
  price: number;
  change24h: number;
  timestamp: string;
  symbol?: string;
  name?: string;
  marketCap?: number;
  volume24h?: number;
  circulatingSupply?: number;
  totalSupply?: number;
}

export class MarketDataService {
  private readonly blockchainService: BlockchainService;
  private readonly CMC_API_KEY: string;
  private readonly XP_CMC_ID = '36056';
  private readonly XP_FALLBACK_PRICE = 0.016571759599689175;

  constructor() {
    this.blockchainService = new BlockchainService();
    this.CMC_API_KEY = process.env.COINMARKETCAP_API_KEY || "";
  }

  /**
   * Get market statistics with caching
   */
  async getMarketStats(): Promise<MarketStats> {
    // Check cache first
    const cachedStats = cache.get(CACHE_KEYS.MARKET_STATS);
    if (cachedStats) {
      console.log("🚀 Market stats served from cache");
      return cachedStats as MarketStats;
    }

    console.log("📡 Fetching market stats from blockchain");

    try {
      // Fetch data in parallel
      const [blockchainStats, xpPrice] = await Promise.all([
        this.blockchainService.getMarketStats(),
        this.fetchXPPrice()
      ]);

      const marketStats: MarketStats = {
        totalValueLocked: blockchainStats.totalValueLocked || "0",
        volume24h: blockchainStats.volume24h || "0",
        totalTrades: 0,
        activePairs: blockchainStats.activePairs || 0,
        xpPrice: xpPrice.price,
        xpsPrice: 1.0,
        topPairs: this.generateTopPairs(xpPrice.price)
      };

      // Cache the result
      cache.set(CACHE_KEYS.MARKET_STATS, marketStats, CACHE_TTL.MARKET_STATS);

      return marketStats;
    } catch (error) {
      console.error("Failed to fetch market stats:", error);
      throw new Error("Failed to fetch market statistics");
    }
  }

  /**
   * Get XP token price
   */
  async getXPPrice(): Promise<PriceData> {
    // Check cache first
    const cachedPrice = cache.get(CACHE_KEYS.XP_PRICE);
    if (cachedPrice) {
      console.log("🚀 XP Price served from cache");
      return cachedPrice as PriceData;
    }

    return this.fetchXPPrice();
  }

  /**
   * Get XPS token price
   */
  async getXPSPrice(): Promise<PriceData> {
    // Check cache first
    const cachedData = cache.get('xps_price');
    if (cachedData) {
      return cachedData as PriceData;
    }

    // XPS is pegged to $1 USD in the current implementation
    const priceData: PriceData = {
      price: 1.0,
      change24h: 0,
      symbol: "XPS",
      name: "XPSwap Token",
      marketCap: 10000000, // $10M market cap
      volume24h: 500000,   // $500K daily volume
      circulatingSupply: 10000000,
      totalSupply: 100000000,
      timestamp: new Date().toISOString()
    };

    // Cache the result
    cache.set('xps_price', priceData, 60); // 60 seconds TTL

    return priceData;
  }

  /**
   * Fetch XP price from CoinMarketCap
   */
  private async fetchXPPrice(): Promise<PriceData> {
    console.log("📡 Fetching XP Price from CoinMarketCap API");
    
    try {
      const response = await fetch(
        `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?id=${this.XP_CMC_ID}`,
        {
          headers: {
            "X-CMC_PRO_API_KEY": this.CMC_API_KEY,
            "Accept": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const quote = data.data?.[this.XP_CMC_ID]?.quote?.USD;
        
        const priceData: PriceData = {
          price: quote?.price || this.XP_FALLBACK_PRICE,
          change24h: quote?.percent_change_24h || 0,
          timestamp: new Date().toISOString()
        };

        // Cache the result
        cache.set(CACHE_KEYS.XP_PRICE, priceData, CACHE_TTL.XP_PRICE);

        return priceData;
      }
    } catch (error) {
      console.error("Failed to fetch XP price:", error);
    }

    // Return fallback data
    const fallbackData: PriceData = {
      price: this.XP_FALLBACK_PRICE,
      change24h: 0,
      timestamp: new Date().toISOString()
    };

    // Cache even the fallback data to prevent hammering the API
    cache.set(CACHE_KEYS.XP_PRICE, fallbackData, CACHE_TTL.XP_PRICE);

    return fallbackData;
  }

  /**
   * Generate top trading pairs
   */
  private generateTopPairs(xpPrice: number): MarketStats['topPairs'] {
    return [
      {
        pair: "XP/XPS",
        volume: "0",
        price: xpPrice.toFixed(6),
        change: "0.00%"
      },
      {
        pair: "XP/USDT",
        volume: "0",
        price: xpPrice.toFixed(6),
        change: "0.00%"
      },
      {
        pair: "XPS/USDT",
        volume: "0",
        price: "1.000000",
        change: "0.00%"
      }
    ];
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();
