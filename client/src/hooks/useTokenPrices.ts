import { useQuery } from "@tanstack/react-query";

interface TokenPrice {
  price: number;
  change24h: number;
}

interface TokenPrices {
  [symbol: string]: TokenPrice;
}

export function useTokenPrices(symbols: string[] = ["XP", "BTC", "ETH", "USDT"]) {
  return useQuery<TokenPrices>({
    queryKey: ["/api/token-prices", symbols.join(",")],
    queryFn: async () => {
      const response = await fetch(`/api/token-prices?symbols=${symbols.join(",")}`);
      if (!response.ok) {
        throw new Error("Failed to fetch token prices");
      }
      return response.json();
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
      
      const response = await fetch(`/api/token-balance/${address}/${tokenSymbol}`);
      if (!response.ok) {
        throw new Error("Failed to fetch token balance");
      }
      return response.json();
    },
    enabled: !!address,
    refetchInterval: 15000, // Refetch every 15 seconds
  });
}