import { ethers } from "ethers";

export interface ExternalDEX {
  name: string;
  chainId: number;
  router: string;
  factory: string;
  logo: string;
  enabled: boolean;
}

export interface AggregatorQuote {
  dex: string;
  amountOut: string;
  priceImpact: number;
  gas: string;
  route: string[];
  confidence: number;
}

export interface AggregatedQuote {
  bestQuote: AggregatorQuote;
  allQuotes: AggregatorQuote[];
  savings: string;
  executionTime: number;
}

// External DEX configurations
export const EXTERNAL_DEXES: ExternalDEX[] = [
  {
    name: "Uniswap V3",
    chainId: 1, // Ethereum
    router: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
    factory: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
    logo: "https://app.uniswap.org/favicon.ico",
    enabled: true,
  },
  {
    name: "PancakeSwap V3",
    chainId: 56, // BSC
    router: "0x13f4EA83D0bd40E75C8222255bc855a974568Dd4",
    factory: "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
    logo: "https://pancakeswap.finance/favicon.ico",
    enabled: true,
  },
  {
    name: "SushiSwap",
    chainId: 1, // Ethereum
    router: "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F",
    factory: "0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac",
    logo: "https://app.sushi.com/favicon.ico",
    enabled: true,
  }
];

export class DEXAggregator {
  private dexes: ExternalDEX[];
  
  constructor() {
    this.dexes = EXTERNAL_DEXES.filter(dex => dex.enabled);
  }

  async getAggregatedQuote(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    chainId: number
  ): Promise<AggregatedQuote> {
    const startTime = Date.now();
    
    // Filter DEXes by chain
    const relevantDexes = this.dexes.filter(dex => dex.chainId === chainId);
    
    if (relevantDexes.length === 0) {
      throw new Error(`No supported DEXes found for chain ${chainId}`);
    }

    // Get quotes from all DEXes
    const quotePromises = relevantDexes.map(dex => 
      this.getQuoteFromDEX(dex, tokenIn, tokenOut, amountIn)
    );

    const quotes = await Promise.allSettled(quotePromises);
    const validQuotes: AggregatorQuote[] = [];

    quotes.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        validQuotes.push(result.value);
      } else {
        console.warn(`Failed to get quote from ${relevantDexes[index].name}:`, result);
      }
    });

    if (validQuotes.length === 0) {
      throw new Error("No valid quotes found from external DEXes");
    }

    // Sort by best price (highest amountOut)
    validQuotes.sort((a, b) => 
      parseFloat(b.amountOut) - parseFloat(a.amountOut)
    );

    const bestQuote = validQuotes[0];
    const secondBest = validQuotes[1];
    
    // Calculate savings compared to second best
    const savings = secondBest 
      ? ((parseFloat(bestQuote.amountOut) - parseFloat(secondBest.amountOut)) / parseFloat(secondBest.amountOut) * 100).toFixed(2)
      : "0";

    return {
      bestQuote,
      allQuotes: validQuotes,
      savings: `${savings}%`,
      executionTime: Date.now() - startTime,
    };
  }

  private async getQuoteFromDEX(
    dex: ExternalDEX,
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<AggregatorQuote> {
    try {
      // Simulate API calls to external DEXes
      // In production, this would call actual DEX APIs
      
      const mockQuote = await this.simulateExternalQuote(dex, tokenIn, tokenOut, amountIn);
      
      return {
        dex: dex.name,
        amountOut: mockQuote.amountOut,
        priceImpact: mockQuote.priceImpact,
        gas: mockQuote.gas,
        route: [tokenIn, tokenOut],
        confidence: mockQuote.confidence,
      };
    } catch (error) {
      console.error(`Error getting quote from ${dex.name}:`, error);
      throw error;
    }
  }

  private async simulateExternalQuote(
    dex: ExternalDEX,
    tokenIn: string,
    tokenOut: string,
    amountIn: string
  ): Promise<{
    amountOut: string;
    priceImpact: number;
    gas: string;
    confidence: number;
  }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    const inputAmount = parseFloat(amountIn);
    
    // Simulate different exchange rates and fees for different DEXes
    let rate = 1.85; // Base rate for XP to USDT
    let fee = 0.003; // 0.3% fee
    
    switch (dex.name) {
      case "Uniswap V3":
        rate = 1.87;
        fee = 0.0005; // 0.05% fee tier
        break;
      case "PancakeSwap V3":
        rate = 1.86;
        fee = 0.0025; // 0.25% fee
        break;
      case "SushiSwap":
        rate = 1.84;
        fee = 0.003; // 0.3% fee
        break;
    }
    
    // Add some randomness to simulate market conditions
    rate *= (0.98 + Math.random() * 0.04);
    
    const amountOut = (inputAmount * rate * (1 - fee)).toFixed(6);
    const priceImpact = Math.random() * 0.5; // 0-0.5% price impact
    const gasEstimate = (21000 + Math.random() * 100000).toFixed(0);
    
    return {
      amountOut,
      priceImpact,
      gas: gasEstimate,
      confidence: 85 + Math.random() * 10, // 85-95% confidence
    };
  }

  getSupportedNetworks(): number[] {
    const chainIds = this.dexes.map(dex => dex.chainId);
    return Array.from(new Set(chainIds));
  }

  getDEXesByChain(chainId: number): ExternalDEX[] {
    return this.dexes.filter(dex => dex.chainId === chainId);
  }
}

export const dexAggregator = new DEXAggregator();