import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/lib/config";

interface TokenPrice {
  price: number;
  change24h: number;
}

interface TokenPrices {
  [symbol: string]: TokenPrice;
}

export function useTokenPrices(symbols: string[] = ["XP", "XPS", "BTC", "ETH", "USDT"]) {
  return useQuery<TokenPrices>({
    queryKey: ["/api/xp-price", symbols.join(",")],
    queryFn: async () => {
      // For now, we'll get XP price from the dedicated endpoint
      // and mock other token prices
      const xpResponse = await fetch(getApiUrl('/xp-price'));
      const xpData = await xpResponse.json();
      
      const prices: TokenPrices = {
        XP: {
          price: xpData.price || 0.016571759599689175,
          change24h: xpData.change24h || 0
        },
        XPS: {
          price: 1.0, // Fixed at 1 USD
          change24h: 0
        },
        BTC: {
          price: 96420,
          change24h: 1.2
        },
        ETH: {
          price: 3340,
          change24h: 2.1
        },
        USDT: {
          price: 1.0,
          change24h: 0
        }
      };
      
      // Return only requested symbols
      const result: TokenPrices = {};
      symbols.forEach(symbol => {
        if (prices[symbol]) {
          result[symbol] = prices[symbol];
        }
      });
      
      return result;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 25000, // Consider data stale after 25 seconds
  });
}

export function useTokenBalance(address: string | null, tokenSymbol: string) {
  return useQuery({
    queryKey: ["/api/token-balance", address, tokenSymbol],
    queryFn: async () => {
      if (!address) return { balance: "0", symbol: tokenSymbol };
      
      const response = await fetch(getApiUrl(`/token-balance/${address}/${tokenSymbol}`));
      if (!response.ok) {
        // Return mock balance for development
        return { 
          balance: tokenSymbol === "XP" ? "1000.0000" : "500.0000", 
          symbol: tokenSymbol 
        };
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}